import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { closePricing, setUser } from "../../store/slices/authSlice";
import * as api from "../../services/api";

const PACKS = [
  {
    id: "trial",
    packSize: 3,
    title: "Trial Pack",
    price: 29,
    description: "Perfect for a quick test run before your interview.",
    popular: false,
  },
  {
    id: "standard",
    packSize: 5,
    title: "Standard Pack",
    price: 49,
    description: "Highly recommended for comprehensive practice.",
    popular: true,
  },
  {
    id: "value",
    packSize: 10,
    title: "Best Value Pack",
    price: 75,
    description: "Ultimate bundle for complete preparation across multiple roles.",
    popular: false,
  },
];

export default function PricingModal() {
  const dispatch = useDispatch();
  const { getAccessTokenSilently } = useAuth0();
  const isPricingOpen = useSelector((state) => state.auth.isPricingOpen);
  const user = useSelector((state) => state.auth.user);
  
  const [loadingPack, setLoadingPack] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isPricingOpen) return null;

  const handlePurchase = async (pack) => {
    setLoadingPack(pack.id);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = await getAccessTokenSilently();

      // 1. Create order on backend
      const orderRes = await api.createRazorpayOrder(token, { packSize: pack.packSize });
      if (!orderRes.success) {
        throw new Error(orderRes.message || "Failed to create payment order");
      }

      const { orderId, amount, currency } = orderRes;

      // 2. Open Razorpay Checkout overlay
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder";

      const options = {
        key: razorpayKey,
        amount: amount,
        currency: currency,
        name: "PrepAI",
        description: `Purchase ${pack.packSize} Session Credits`,
        order_id: orderId,
        handler: async function (response) {
          try {
            setLoadingPack(pack.id);
            // 3. Verify payment signature on backend
            const verifyRes = await api.verifyRazorpayPayment(token, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packSize: pack.packSize,
            });

            if (verifyRes.success) {
              dispatch(setUser(verifyRes.user));
              setSuccessMsg(`Successfully credited ${pack.packSize} sessions to your account!`);
              setTimeout(() => {
                dispatch(closePricing());
                setSuccessMsg(null);
              }, 2500);
            } else {
              throw new Error(verifyRes.message || "Payment verification failed");
            }
          } catch (err) {
            console.error("Verification error:", err);
            setError(err.message || "Signature verification failed. Please contact support.");
          } finally {
            setLoadingPack(null);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#4ade80",
        },
        modal: {
          ondismiss: function () {
            setLoadingPack(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Purchase initiation failed:", err);
      setError(err.message || "Failed to initiate payment. Please try again.");
      setLoadingPack(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-surface border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute -top-1/4 -right-1/4 w-96 h-96 bg-green/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Close Button */}
        <button
          onClick={() => dispatch(closePricing())}
          className="absolute top-4 right-4 text-muted hover:text-[#f8faf8] transition-colors p-2 hover:bg-white/5 rounded-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Heading */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold tracking-widest text-green uppercase font-mono">
            Pricing Plans
          </span>
          <h2 className="text-3xl font-extrabold text-[#f8faf8] mt-2">
            Choose Your Pack
          </h2>
          <p className="text-sm text-muted mt-2 max-w-md mx-auto">
            Top up your session credits to continue practicing with our AI-powered real-time interactive avatars.
          </p>
          
          <div className="inline-flex items-center gap-1.5 bg-green-muted border border-green/20 rounded-full px-4 py-1.5 text-xs text-green font-mono mt-4">
            <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            Active Balance: {user?.sessionBalance ?? 0} {user?.sessionBalance === 1 ? "credit" : "credits"}
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-xs text-red-400 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-green/10 border border-green/20 text-xs text-green rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Grid Packs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`relative flex flex-col justify-between rounded-xl bg-surface2 border p-6 transition-all duration-300 ${
                pack.popular 
                  ? "border-green shadow-lg scale-102 z-10" 
                  : "border-white/5 hover:border-white/20"
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green text-bg text-[10px] font-bold font-mono px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Popular
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold text-[#f8faf8] mb-1">{pack.title}</h3>
                <p className="text-xs text-muted mb-4 min-h-[36px]">{pack.description}</p>
                
                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-4xl font-extrabold text-[#f8faf8]">₹{pack.price}</span>
                  <span className="text-xs text-muted font-mono">/ {pack.packSize} sessions</span>
                </div>

                <ul className="space-y-3 mb-8 text-xs text-muted">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{pack.packSize} high-quality sessions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Real-time voice avatar AI</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Instant detailed reports</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handlePurchase(pack)}
                disabled={loadingPack !== null}
                className={`w-full py-3 rounded-lg font-semibold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  pack.popular
                    ? "bg-green text-bg hover:opacity-90 disabled:opacity-50"
                    : "bg-white/5 hover:bg-white/10 text-[#f8faf8] disabled:opacity-50"
                }`}
              >
                {loadingPack === pack.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Buy Credits</span>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-[#4a5e4e] mt-8 font-mono">
          Secured by Razorpay • Instant verification • Refundable within 24 hours of unused credits
        </div>
      </div>
    </div>
  );
}
