import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/dashboard/Navbar";
import * as api from "../services/api";

function formatDate(dateStr) {
  if (!dateStr) return "unknown date";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export default function TransactionsPage() {
  const { getAccessTokenSilently } = useAuth0();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = await getAccessTokenSilently();
        const data = await api.getTransactionHistory(token);
        if (data.success) {
          setTransactions(data.transactions || []);
        } else {
          throw new Error(data.message || "Failed to load transactions");
        }
      } catch (err) {
        console.error("Transactions fetch error:", err);
        setError("Could not load your transaction history.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [getAccessTokenSilently]);

  return (
    <div className="min-h-screen bg-bg text-[#f8faf8] font-sans">
      <Navbar />
      <main className="px-10 py-7 max-w-6xl mx-auto animate-page-fade">
        {/* Header */}
        <div className="mb-8">
          <span className="text-[11px] font-bold tracking-widest text-green uppercase font-mono">
            billing records
          </span>
          <h1 className="text-3xl font-bold tracking-tight mt-1">
            Transaction History
          </h1>
          <p className="text-sm text-muted mt-2">
            View all session credits packages purchased on your account.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {/* Noise overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-green/20 border-t-green rounded-full animate-spin" />
                <span className="text-xs text-muted font-mono">Retrieving transactions...</span>
              </div>
            ) : error ? (
              <div className="py-12 text-center text-sm text-rose-400 font-mono">
                {error}
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-muted text-lg">
                  💵
                </div>
                <h3 className="text-sm font-semibold text-[#f8faf8]">No transactions found</h3>
                <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                  You haven't purchased any credits yet. Top up your balance from the dashboard or navbar.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] text-dim uppercase tracking-wider font-mono font-bold">
                      <th className="pb-4 font-semibold">Date & Time</th>
                      <th className="pb-4 font-semibold">Payment ID</th>
                      <th className="pb-4 font-semibold">Sessions</th>
                      <th className="pb-4 font-semibold text-right">Amount Paid</th>
                      <th className="pb-4 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03] text-sm">
                    {transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 text-[#f8faf8] font-medium min-w-[180px]">
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className="py-4 font-mono text-xs text-muted">
                          {tx.razorpayPaymentId}
                        </td>
                        <td className="py-4 text-muted">
                          <span className="text-[#f8faf8] font-semibold">{tx.packSize}</span> sessions pack
                        </td>
                        <td className="py-4 text-right font-mono text-green font-semibold">
                          ₹{tx.amount}.00
                        </td>
                        <td className="py-4 text-center">
                          <span className="inline-flex items-center gap-1 bg-green-muted border border-green/10 text-green text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
