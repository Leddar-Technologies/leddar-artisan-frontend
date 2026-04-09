"use client";

import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import { Wallet, Clock, CheckCircle, Info } from 'lucide-react';

export default function Payments() {
  const { payments, jobs } = useApp();

  const totalEarned = payments
    .filter(p => p.status === 'received')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments
    .filter(p => p.status === 'pending' || p.status === 'released')
    .reduce((sum, p) => sum + p.amount, 0);

  const getJobById = (jobId: string) => jobs.find(j => j.id === jobId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge variant="success">Received</Badge>;
      case 'released':
        return <Badge variant="info">Released</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStageBadge = (stage: string) => {
    return stage === 'raw_material' ? (
      <Badge variant="info">Raw Material</Badge>
    ) : (
      <Badge variant="success">Service Payment</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">Payments</h1>
        <p className="text-neutral-700 mt-1">Track your earnings and payment history</p>
      </div>

      <Card className="bg-gradient-to-r from-surface-100 to-surface-50 border-l-4 border-l-leather">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="text-leather flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-ink mb-2">Payment Stages Explained</h3>
              <div className="space-y-2 text-sm text-neutral-900">
                <p>
                  <strong>Stage 1 - Raw Material Payment:</strong> Paid before production starts to help you purchase materials.
                </p>
                <p>
                  <strong>Stage 2 - Service Payment:</strong> Paid after job completion as compensation for your work.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-16">
              <Wallet className="mx-auto text-stone-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-stone-900 mb-2">No Payments Yet</h3>
              <p className="text-stone-600">Complete jobs to start earning payments</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {payments
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(payment => {
                    const job = getJobById(payment.jobId);
                    return (
                      <div key={payment.id} className="rounded-xl border border-surface-400 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-ink">{job?.productType || 'Unknown Job'}</p>
                            <p className="text-xs text-neutral-700 mt-0.5">Job ID: {payment.jobId}</p>
                          </div>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-neutral-700">Amount</p>
                            <p className="font-semibold text-ink">₦{payment.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-neutral-700">Date</p>
                            <p className="font-medium text-ink">
                              {new Date(payment.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">{getStageBadge(payment.stage)}</div>
                      </div>
                    );
                  })}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-3 px-4 font-semibold text-stone-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-stone-700">Job</th>
                    <th className="text-left py-3 px-4 font-semibold text-stone-700">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-stone-700">Stage</th>
                    <th className="text-left py-3 px-4 font-semibold text-stone-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(payment => {
                      const job = getJobById(payment.jobId);
                      return (
                        <tr key={payment.id} className="border-b border-stone-100 hover:bg-stone-50">
                          <td className="py-4 px-4 text-stone-700">
                            {new Date(payment.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-stone-900">{job?.productType || 'Unknown Job'}</p>
                              <p className="text-xs text-stone-500">Job ID: {payment.jobId}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-semibold text-stone-900">₦{payment.amount.toLocaleString()}</p>
                          </td>
                          <td className="py-4 px-4">
                            {getStageBadge(payment.stage)}
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
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle size={20} />
            Payment Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-stone-900">Job Assigned</h4>
                <p className="text-sm text-stone-600">You receive a new job assignment</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-700 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-stone-900">Raw Material Payment</h4>
                <p className="text-sm text-stone-600">First payment released to purchase materials</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-700 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-stone-900">Production Phase</h4>
                <p className="text-sm text-stone-600">You work on completing the job</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-700 font-bold text-sm">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-stone-900">Service Payment</h4>
                <p className="text-sm text-stone-600">Final payment released after job completion</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
