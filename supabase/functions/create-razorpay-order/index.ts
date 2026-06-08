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
    const { courseId, userEmail, amount, leadId } = await req.json()

    if (!courseId || !userEmail || !amount) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. In a real app, call Razorpay API here to create an order ID
    // const razorpayOrder = await fetch('https://api.razorpay.com/v1/orders', ...)
    // For this prototype, we'll simulate a Razorpay order creation
    const simulatedOrderId = `order_${Math.random().toString(36).substring(2, 15)}`

    // 2. Initialize Supabase client with the SERVICE ROLE key
    // This allows us to bypass RLS and securely insert the payment record
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Create the payment record in the database
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_email: userEmail,
        course_id: courseId,
        amount: amount,
        razorpay_order_id: simulatedOrderId,
        status: 'created'
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    // Return the Order ID to the frontend so it can open the Razorpay Checkout Modal
    return new Response(
      JSON.stringify({
        success: true,
        orderId: simulatedOrderId,
        paymentId: payment.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
