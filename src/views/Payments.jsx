"use client";

import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import {
  Wallet,
  Clock,
  CheckCircle,
  Info,
  Coins,
  Banknote,
} from "lucide-react";

export default function Payments() {
  // Access data from Redux slices
  const { payments = [] } = useSelector((state) => state.payments || {});
  const { jobs = [] } = useSelector((state) => state.jobs || {});

  const getJobById = (jobId) => jobs.find((j) => j.id === jobId);

  const samplePayments = payments
    .filter((payment) => getJobById(payment.jobId)?.jobType === "sample")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const productionPayments = payments
    .filter((payment) => getJobById(payment.jobId)?.jobType === "production")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalEarned = payments
    .filter((p) => p.status === "received")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments
    .filter((p) => p.status === "pending" || p.status === "released")
    .reduce((sum, p) => sum + p.amount, 0);

  const samplePaymentTotal = samplePayments
    .filter((p) => p.status === "received")
    .reduce((sum, p) => sum + p.amount, 0);

  const productionPaymentTotal = productionPayments
    .filter((p) => p.status === "received")
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case "received":
        return <Badge variant="success">Received</Badge>;
      case "released":
        return <Badge variant="info">Released</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStageBadge = (stage) => {
    return stage === "raw_material" ? (
      <Badge variant="info">Raw Material</Badge>
    ) : (
      <Badge variant="success">Service Payment</Badge>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">Payments</h1>
        <p className="text-neutral-700 mt-1">
          Track sample payments and production stage payments in one place.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <StatCard
          title="Total Earned"
          value={`₦${totalEarned.toLocaleString()}`}
          icon={Wallet}
          iconColor="text-success"
        />
        <StatCard
          title="Pending Payments"
          value={`₦${pendingPayments.toLocaleString()}`}
          icon={Clock}
          iconColor="text-gold"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StatCard
          title="Sample Payments Earned"
          value={`₦${samplePaymentTotal.toLocaleString()}`}
          icon={Coins}
          iconColor="text-leather"
        />
        <StatCard
          title="Production Payments Earned"
          value={`₦${productionPaymentTotal.toLocaleString()}`}
          icon={Banknote}
          iconColor="text-success"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sample Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {samplePayments.length === 0 ? (
            <div className="text-center py-16">
              <Wallet className="mx-auto text-stone-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                No Sample Payments Yet
              </h3>
              <p className="text-stone-600">
                Complete sample jobs to receive sample payments.
              </p>
            </div>
          ) : (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-3 px-4 font-semibold text-stone-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-stone-700">
                      Job
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-stone-700">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-stone-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {samplePayments.map((payment) => {
                    const job = getJobById(payment.jobId);
                    return (
                      <tr
                        key={payment.id}
                        className="border-b border-stone-100 hover:bg-stone-50"
                      >
                        <td className="py-4 px-4">
                          {new Date(payment.date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-stone-900">
                            {job?.productType || "Unknown Job"}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          ₦{payment.amount.toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(payment.status)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-surface-100 to-surface-50 border-l-4 border-l-leather">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="text-leather flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-ink mb-2">
                Payment Stages Explained
              </h3>
              <div className="space-y-2 text-sm text-neutral-900">
                <p>
                  <strong>Stage 1 - Raw Material Payment:</strong> Paid before
                  production starts.
                </p>
                <p>
                  <strong>Stage 2 - Service Payment:</strong> Paid after job
                  completion.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
