"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useApp } from "../context/AppContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import {
  BadgeCheck,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Fingerprint,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";

export default function KYC() {
  const { user, updateKYC } = useApp();
  const [verificationPanelOpen, setVerificationPanelOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountName: user?.bankAccount?.accountName || "",
    accountNumber: user?.bankAccount?.accountNumber || "",
    bankName: user?.bankAccount?.bankName || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateKYC({
      bankAccount: {
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
      },
      kycStatus: "pending",
    });
    setVerificationPanelOpen(true);
  };

  const handleStartVerification = () => {
    setVerificationPanelOpen(true);
  };

  const status =
    user?.kycStatus === "verified"
      ? {
          label: "Verified",
          tone: "success" as const,
          headline: "Verification complete",
          description:
            "Your account is verified and eligible for jobs and payments.",
          icon: CheckCircle2,
        }
      : user?.kycStatus === "pending"
        ? {
            label: "Pending",
            tone: "warning" as const,
            headline: "Verification in progress",
            description:
              "Your identity review is underway. Jobs and payments remain locked until it is approved.",
            icon: BadgeCheck,
          }
        : user?.kycStatus === "rejected"
          ? {
              label: "Failed",
              tone: "danger" as const,
              headline: "Verification failed",
              description:
                "The submitted details were not approved. You can resubmit with corrected information.",
              icon: AlertCircle,
            }
          : {
              label: "Not started",
              tone: "default" as const,
              headline: "Verification not started",
              description:
                "Complete identity verification and add bank details before jobs and payouts are enabled.",
              icon: Fingerprint,
            };

  const StatusIcon = status.icon;
  const isVerified = status.label === "Verified";

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="overflow-hidden rounded-3xl border border-surface-400/70 bg-white shadow-card">
        <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative bg-gradient-to-br from-white via-[#faf7f2] to-[#eef4f1] px-6 py-7 sm:px-8 sm:py-10 text-ink">
            <div className="absolute inset-0 opacity-100 [background-image:radial-gradient(circle_at_top_right,rgba(209,166,103,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(24,19,16,0.04),transparent_28%)]" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-leather/10 bg-white px-3 py-1 text-sm font-medium text-leather shadow-sm backdrop-blur">
                <ShieldCheck size={16} />
                Identity Verification
              </div>

              <div className="max-w-2xl space-y-3">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">
                  Complete verification to activate jobs and payouts
                </h1>
                <p className="max-w-xl text-sm sm:text-base leading-7 text-neutral-700">
                  Finish identity verification and add a settlement account to
                  keep your profile ready for jobs and payouts.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant={status.tone} className="shadow-sm">
                  {status.label}
                </Badge>
                <Badge variant={isVerified ? "success" : "warning"}>
                  {isVerified ? "Access enabled" : "Access restricted"}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-surface-400/70 bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                    Identity
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink">
                    NIN or Voter&apos;s Card
                  </p>
                </div>
                <div className="rounded-2xl border border-surface-400/70 bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                    Payouts
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink">
                    Bank account details
                  </p>
                </div>
                <div className="rounded-2xl border border-surface-400/70 bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                    Access
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink">
                    Jobs locked until verified
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-100 px-6 py-7 sm:px-8 sm:py-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <StatusIcon
                    className={
                      status.tone === "success"
                        ? "text-success"
                        : status.tone === "warning"
                          ? "text-gold"
                          : status.tone === "danger"
                            ? "text-danger"
                            : "text-neutral-700"
                    }
                    size={24}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-700">
                    Verification status
                  </p>
                  <p className="text-lg font-semibold text-ink">
                    {status.headline}
                  </p>
                </div>
              </div>

              <p className="text-sm leading-6 text-neutral-800">
                {status.description}
              </p>

              <div className="rounded-2xl border border-surface-400/70 bg-white p-4">
                <div className="flex items-start gap-3">
                  <TimerReset className="mt-0.5 text-leather" size={18} />
                  <div>
                    <p className="font-medium text-ink">Verification summary</p>
                    <p className="mt-1 text-sm leading-6 text-neutral-800">
                      Your account status and bank details are shown here for
                      quick review.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-600">
                    Data stored
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    Status + bank details
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-600">
                    Documents
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    Handled outside Leddar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-3">
            <div className="inline-flex rounded-2xl bg-leather/10 p-3 text-leather">
              <Fingerprint size={20} />
            </div>
            <h2 className="text-lg font-semibold text-ink">
              Identity verification
            </h2>
            <p className="text-sm leading-6 text-neutral-700">
              Submit your identity details securely to complete verification.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            <div className="inline-flex rounded-2xl bg-gold/15 p-3 text-leather">
              <Landmark size={20} />
            </div>
            <h2 className="text-lg font-semibold text-ink">
              Settlement account
            </h2>
            <p className="text-sm leading-6 text-neutral-700">
              Capture account name, account number, and bank name for future
              payouts.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            <div className="inline-flex rounded-2xl bg-danger/10 p-3 text-danger">
              <LockKeyhole size={20} />
            </div>
            <h2 className="text-lg font-semibold text-ink">Access control</h2>
            <p className="text-sm leading-6 text-neutral-700">
              Job assignment and payment actions remain disabled until status is
              verified.
            </p>
          </CardContent>
        </Card>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <Card>
          <CardHeader>
            <CardTitle>Verification flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-3xl border border-surface-400/70 bg-white p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-surface-100 p-3 text-ink">
                  <Fingerprint size={22} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-ink">
                    Verification session
                  </h3>
                  <p className="text-sm leading-6 text-neutral-700">
                    Start verification from this section and continue once your
                    identity step is complete.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-surface-100 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                    Step 1
                  </p>
                  <p className="mt-1 font-semibold text-ink">Start session</p>
                </div>
                <div className="rounded-2xl bg-surface-100 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                    Step 2
                  </p>
                  <p className="mt-1 font-semibold text-ink">Submit identity</p>
                </div>
                <div className="rounded-2xl bg-surface-100 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                    Step 3
                  </p>
                  <p className="mt-1 font-semibold text-ink">Review status</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="sm:flex-1"
                  onClick={handleStartVerification}
                  data-testid="start-verification"
                >
                  Start verification
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="sm:flex-1"
                  data-testid="save-kyc"
                >
                  Save and mark pending
                </Button>
              </div>

              {verificationPanelOpen && (
                <div className="mt-4 rounded-2xl border border-leather/20 bg-leather/5 p-4 text-sm leading-6 text-ink">
                  Verification session is open.
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-ink px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <Sparkles size={18} />
                <p className="font-medium">
                  A clear, secure verification flow for your account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Account name"
              placeholder="Your full legal name"
              value={formData.accountName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("accountName", e.target.value)
              }
            />

            <Input
              label="Account number"
              placeholder="0123456789"
              inputMode="numeric"
              value={formData.accountNumber}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("accountNumber", e.target.value)
              }
            />

            <Input
              label="Bank name"
              placeholder="Bank name"
              value={formData.bankName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("bankName", e.target.value)
              }
            />

            <div className="rounded-2xl border border-surface-400/70 bg-surface-100 p-4 text-sm leading-6 text-neutral-700">
              Keep this section focused on the account details needed for
              payouts.
            </div>

            <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm leading-6 text-leather">
              Display states only: Pending, Verified, Failed. Internally, Failed
              maps to the rejected state.
            </div>

            <div className="rounded-2xl border border-surface-400/70 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                    Current state
                  </p>
                  <p className="mt-1 text-lg font-semibold text-ink">
                    {status.label}
                  </p>
                </div>
                <Badge variant={status.tone}>{status.label}</Badge>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              data-testid="submit-kyc"
            >
              Submit bank details
              <ChevronRight className="ml-2" size={18} />
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
