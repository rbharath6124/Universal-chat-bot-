import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Lock } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { supabase } from "../lib/supabase";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  courseId: string;
  price: number;
}

export default function EnrollmentModal({
  isOpen,
  onClose,
  courseTitle,
  courseId,
  price,
}: EnrollmentModalProps) {
  const { theme } = useTheme();
  const [step, setStep] = useState<"details" | "processing" | "success">("details");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    college: "",
  });

  const btnGrad = `linear-gradient(135deg, rgb(${theme.c1}), rgb(${theme.c2}))`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");

    try {
      // 1. Save the Lead to Supabase (so we have their info even if payment drops)
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            college: formData.college,
            program_interest: courseId,
            status: "new",
          },
        ])
        .select()
        .single();

      if (leadError) throw leadError;

      // 2. Call our secure Edge Function to generate Razorpay Order
      // (Assuming the Edge Function is deployed and accessible at the standard endpoint)
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        "create-razorpay-order",
        {
          body: {
            courseId,
            userEmail: formData.email,
            amount: price,
            leadId: leadData.id,
          },
        }
      );

      if (orderError) throw orderError;

      // 3. Open Razorpay Checkout (We'll simulate the Razorpay UI pop-up here)
      // In production, you would load Razorpay checkout script and pass the orderData.orderId
      setTimeout(async () => {
        try {
          // Simulate payment success and call our verification endpoint
          const { error: verifyError } = await supabase.functions.invoke(
            "verify-razorpay-payment",
            {
              body: {
                orderId: orderData.orderId,
                paymentId: `pay_${Math.random().toString(36).substring(2, 10)}`,
                razorpaySignature: "mock_signature_for_prototype",
              },
            }
          );

          if (verifyError) throw verifyError;
          
          setStep("success");
        } catch (verifyErr) {
          console.error("Verification failed:", verifyErr);
          alert("Payment verification failed. Please contact support.");
          setStep("details");
        }
      }, 2000);

    } catch (err) {
      console.error("Enrollment failed:", err);
      alert("Failed to initiate enrollment. Please try again.");
      setStep("details");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-16 sm:pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border p-8 shadow-2xl"
            style={{ borderColor: theme.border, background: theme.glass, color: theme.text }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 transition hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>

            {step === "details" && (
              <>
                <h3 className="mb-2 text-2xl font-bold">Enroll Now</h3>
                <p className="mb-6 text-sm" style={{ color: theme.textMuted }}>
                  You are enrolling in <strong>{courseTitle}</strong> for ₹{price}.
                </p>

                <div 
                  className="mb-6 rounded-xl border p-4 text-sm"
                  style={{ borderColor: theme.border, background: `rgba(${theme.c1}, 0.05)` }}
                >
                  <p className="mb-2 font-semibold" style={{ color: theme.text }}>
                    Having trouble or prefer direct payment? Contact Support:
                  </p>
                  <div className="flex items-center gap-2 font-medium" style={{ color: `rgb(${theme.c1})` }}>
                    <span>📞 9998566635</span>
                    <span className="text-gray-400">|</span>
                    <span>✉️ support@asscendro.com</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Full Name</label>
                    <input
                      required
                      type="text"
                      className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                      style={{
                        borderColor: theme.border,
                        background: "rgba(0,0,0,0.2)",
                        color: theme.text,
                      }}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Email Address (Used for Login)</label>
                    <input
                      required
                      type="email"
                      className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                      style={{
                        borderColor: theme.border,
                        background: "rgba(0,0,0,0.2)",
                        color: theme.text,
                      }}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Phone Number</label>
                    <input
                      required
                      type="tel"
                      className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                      style={{
                        borderColor: theme.border,
                        background: "rgba(0,0,0,0.2)",
                        color: theme.text,
                      }}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">College / University</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                      style={{
                        borderColor: theme.border,
                        background: "rgba(0,0,0,0.2)",
                        color: theme.text,
                      }}
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5" style={{ color: theme.textMuted }}>
                      <Lock className="h-4 w-4" /> Secure Checkout
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl py-4 font-semibold text-white transition hover:brightness-110"
                    style={{ background: btnGrad }}
                  >
                    Proceed to Payment
                  </button>
                </form>
              </>
            )}

            {step === "processing" && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="mb-4 h-12 w-12 animate-spin" style={{ color: `rgb(${theme.c1})` }} />
                <h3 className="mb-2 text-xl font-bold">Initiating Secure Payment...</h3>
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  Please do not close this window.
                </p>
              </div>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div
                  className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: `rgba(${theme.c1}, 0.2)`, color: `rgb(${theme.c1})` }}
                >
                  <Lock className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">Payment Successful!</h3>
                <p className="mb-8" style={{ color: theme.textMuted }}>
                  Your account has been securely provisioned. Please sign in with the email address you just provided ({formData.email}) to access your course.
                </p>
                <button
                  onClick={() => {
                    // Trigger Google Login
                    supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: { redirectTo: `${window.location.origin}/learn` }
                    });
                  }}
                  className="w-full rounded-xl py-4 font-semibold text-white transition hover:brightness-110 flex items-center justify-center gap-3 bg-white/10"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
