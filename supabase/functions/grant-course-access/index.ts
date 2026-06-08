import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, message: 'Missing Authorization header' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    // Hardcoding the admin emails to bypass environment variable loading issues
    const allowedAdmins = ['admin@asscendro.com', 'rbharath0467@gmail.com']

    // Validate the token to get the calling user
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user || !user.email) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized. Invalid token. ' + (userError?.message || '') }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (!allowedAdmins.includes(user.email.toLowerCase())) {
      return new Response(JSON.stringify({ success: false, message: `Forbidden. User ${user.email} is not in admin list: ${adminEmailsStr}` }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const adminEmail = user.email

    const { action, courseId, grantEmail } = await req.json()

    if (!action || !courseId || !grantEmail) {
      return new Response(JSON.stringify({ success: false, message: 'Missing required parameters (action, courseId, grantEmail)' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const targetEmail = grantEmail.trim().toLowerCase()

    // Initialize Service Role client to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    if (action === 'grant') {
      // Check if already exists
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('lms_purchases')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_email', targetEmail)
        .maybeSingle()

      if (existing) {
        if (existing.active) {
          return new Response(JSON.stringify({ success: false, message: 'Student already enrolled' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        } else {
          // Reactivate
          const { error: updateError } = await supabaseAdmin
            .from('lms_purchases')
            .update({ 
              active: true, 
              granted_by: adminEmail, 
              granted_at: new Date().toISOString(),
              access_type: 'manual_admin_grant'
            })
            .eq('id', existing.id)

          if (updateError) throw updateError
          return new Response(JSON.stringify({ success: true, message: `Access re-granted to ${targetEmail}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
      } else {
        // Insert new
        const { error: insertError } = await supabaseAdmin
          .from('lms_purchases')
          .insert({
            course_id: courseId,
            user_email: targetEmail,
            granted_by: adminEmail,
            granted_at: new Date().toISOString(),
            access_type: 'manual_admin_grant',
            active: true
          })

        if (insertError) throw insertError
        return new Response(JSON.stringify({ success: true, message: `Access granted to ${targetEmail}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
    } else if (action === 'revoke') {
      const { error: updateError } = await supabaseAdmin
        .from('lms_purchases')
        .update({ active: false })
        .eq('course_id', courseId)
        .eq('user_email', targetEmail)

      if (updateError) throw updateError
      return new Response(JSON.stringify({ success: true, message: `Access revoked for ${targetEmail}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    } else {
      return new Response(JSON.stringify({ success: false, message: 'Invalid action' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
