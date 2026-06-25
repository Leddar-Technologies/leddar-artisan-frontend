"use client";

import { useEffect, useState } from "react";
import apiClient from "../services/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import {
  Wallet, Clock, Info, Coins, Banknote, Loader2, RefreshCw, FileDown,
} from "lucide-react";

const STAGE_LABEL = {
  MATERIAL:    "Raw Materials",
  SERVICE:     "Service Fee",
  FULL_PAYMENT:"Full Payment",
  SAMPLE_FLAT_FEE: "Sample Fee",
};

const STATUS_VARIANT = {
  RELEASED: "success",
  RECEIVED: "success",
  HELD_IN_ESCROW: "info",
  PENDING: "warning",
  FAILED: "danger",
};

const STATUS_LABEL = {
  RELEASED: "Released",
  RECEIVED: "Received",
  HELD_IN_ESCROW: "In Escrow",
  PENDING: "Pending",
  FAILED: "Failed",
};

function formatNaira(n) {
  return `₦${Number(n || 0).toLocaleString("en-NG")}`;
}

export default function Payments() {
  const [payments, setPayments]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const loadPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get("/artisans/payments");
      setPayments(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (paymentId, ref) => {
    setDownloadingId(paymentId);
    try {
      const res = await apiClient.get(`/artisans/payments/${paymentId}/receipt`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = ref ? `${ref}.pdf` : `PAY-${paymentId.slice(0, 8).toUpperCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Receipt download failed:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => { loadPayments(); }, []);

  // Derived totals
  const totalEarned   = payments
    .filter((p) => p.status === "RELEASED" || p.status === "RECEIVED")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending  = payments
    .filter((p) => p.status === "PENDING" || p.status === "HELD_IN_ESCROW")
    .reduce((sum, p) => sum + p.amount, 0);

  const sampleTotal   = payments
    .filter((p) => (p.status === "RELEASED" || p.status === "RECEIVED") && p.order?.type === "SAMPLE")
    .reduce((sum, p) => sum + p.amount, 0);

  const productionTotal = payments
    .filter((p) => (p.status === "RELEASED" || p.status === "RECEIVED") && p.order?.type === "PRODUCTION")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink">Payments</h1>
          <p className="text-neutral-700 mt-1">
            Track your sample and production earnings.
          </p>
        </div>
        <button
          onClick={loadPayments}
          disabled={loading}
          className="rounded-xl border border-[#E8DED5] bg-white p-2 text-[#6A5B54] hover:bg-[#F4EFEA] transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard title="Total Earned"      value={formatNaira(totalEarned)}     icon={Wallet}  iconColor="text-success" />
        <StatCard title="Pending / Escrow"  value={formatNaira(totalPending)}    icon={Clock}   iconColor="text-gold" />
        <StatCard title="Sample Earnings"   value={formatNaira(sampleTotal)}     icon={Coins}   iconColor="text-leather" />
        <StatCard title="Production Earnings" value={formatNaira(productionTotal)} icon={Banknote} iconColor="text-success" />
      </div>

      {/* Payment history table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-leather" />
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-red-500">{error}</p>
          ) : payments.length === 0 ? (
            <div className="py-16 text-center">
              <Wallet className="mx-auto mb-4 text-stone-300" size={56} />
              <p className="text-lg font-semibold text-ink">No payments yet</p>
              <p className="mt-1 text-sm text-neutral-600">
                Payments appear here once admin releases your earnings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-stone-100">
                    {["Date", "Order", "Type", "Stage", "Amount", "Status", "Receipt"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString("en-NG")}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-leather whitespace-nowrap">
                        {p.order?.ref || (p.orderId ? `#${p.orderId.slice(0, 8).toUpperCase()}` : "—")}
                      </td>
                      <td className="px-4 py-3">
                        {p.order?.type ? (
                          <Badge variant={p.order.type === "SAMPLE" ? "warning" : "info"}>
                            {p.order.type === "SAMPLE" ? "Sample" : "Production"}
                          </Badge>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-neutral-700 font-medium">
                        {STAGE_LABEL[p.stage] || p.stage}
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink">
                        {formatNaira(p.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[p.status] || "default"}>
                          {STATUS_LABEL[p.status] || p.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {(p.status === "RELEASED" || p.status === "RECEIVED") ? (
                          <button
                            onClick={() => handleDownloadReceipt(p.id, p.ref || p.id)}
                            disabled={downloadingId === p.id}
                            className="flex items-center gap-1 rounded-lg border border-[#E8DED5] bg-white px-2.5 py-1.5 text-[11px] font-medium text-leather hover:bg-[#FFF8EF] transition-colors whitespace-nowrap disabled:opacity-50"
                          >
                            {downloadingId === p.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <FileDown className="h-3 w-3" />
                            }
                            Receipt
                          </button>
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stage explanation */}
      <Card className="border-l-4 border-l-leather bg-gradient-to-r from-surface-100 to-surface-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="shrink-0 text-leather" size={22} />
            <div>
              <h3 className="font-semibold text-ink mb-2">Payment Stages Explained</h3>
              <div className="space-y-1.5 text-sm text-neutral-700">
                <p><strong>Stage 1 — Raw Materials:</strong> Released before production starts to cover material costs.</p>
                <p><strong>Stage 2 — Service Fee:</strong> Released after your job is marked Completed — your labour payment.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
