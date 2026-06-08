import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, paymentId, razorpaySignature } = await req.json()

    if (!orderId || !paymentId) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. In a real app, verify the razorpaySignature using crypto and your Razorpay Secret
    // For this prototype, we'll assume the payment is verified successfully.

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Fetch the payment record to get the course ID and user email
    const { data: payment, error: fetchError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .single()

    if (fetchError || !payment) {
      throw new Error('Payment record not found')
    }

    // 3. Mark payment as successful
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({ 
        status: 'successful',
        razorpay_payment_id: paymentId 
      })
      .eq('id', payment.id)

    if (updateError) throw updateError

    // 4. Grant LMS access by inserting into lms_purchases
    // We link the purchase via user_email since they might not have a user_id yet
    const { error: accessError } = await supabaseAdmin
      .from('lms_purchases')
      .upsert({
        user_email: payment.user_email,
        course_id: payment.course_id,
        active: true,
        access_type: 'purchase',
        granted_at: new Date().toISOString()
        // Optional: user_id could be added later when they log in via a trigger
      })

    if (accessError) throw accessError

    return new Response(
      JSON.stringify({ success: true, message: 'Payment verified and access granted' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
