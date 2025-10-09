import React, { useEffect, useState } from "react";
import axios from "axios";

interface IPayment {
  _id: string;
  amount: number;
  status: string;
  gateway: string;
  transactionId?: string;
  createdAt: string;
}

interface PaymentsProps {
  subscriptionId: string;
  token: string; // superadmin token
}

export default function Payments({ subscriptionId, token }: PaymentsProps) {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await axios.post(
          `http://localhost:5000/subscription/subscriptionss/payments`,
          { subscriptionId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          setPayments(res.data.payments || []);
        } else {
          setError("Failed to fetch payments");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [subscriptionId, token]);

  if (loading)
    return (
      <div className="text-center py-6 text-gray-500">Loading payments...</div>
    );
  if (error)
    return (
      <div className="text-center py-6 text-red-500 font-semibold">{error}</div>
    );

  return (
    <div className="p-4 w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Payment Records for Subscription {subscriptionId}
      </h2>

      {payments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No payments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2 text-gray-600 font-medium">Transaction ID</th>
                <th className="text-left px-4 py-2 text-gray-600 font-medium">Amount (₹)</th>
                <th className="text-left px-4 py-2 text-gray-600 font-medium">Status</th>
                <th className="text-left px-4 py-2 text-gray-600 font-medium">Gateway</th>
                <th className="text-left px-4 py-2 text-gray-600 font-medium">Created At</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p._id}
                  className="even:bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <td className="px-4 py-2">{p.transactionId ?? "-"}</td>
                  <td className="px-4 py-2">₹{p.amount.toFixed(2)}</td>
                  <td className="px-4 py-2 capitalize">{p.status}</td>
                  <td className="px-4 py-2 capitalize">{p.gateway}</td>
                  <td className="px-4 py-2">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

