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
      return new Response(JSON.stringify({ success: false, message: `Forbidden. User ${user.email} is not an admin.` }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { lessonId, courseId, googleDriveFileId } = await req.json()

    if (!lessonId || !courseId || !googleDriveFileId) {
      return new Response(JSON.stringify({ success: false, message: 'Missing required parameters' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Initialize Service Role client to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { error: upsertError } = await supabaseAdmin
      .from('lesson_secrets')
      .upsert({
        lesson_id: lessonId,
        course_id: courseId,
        google_drive_file_id: googleDriveFileId
      })

    if (upsertError) throw upsertError

    return new Response(JSON.stringify({ success: true, message: 'Lesson secret saved successfully' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
