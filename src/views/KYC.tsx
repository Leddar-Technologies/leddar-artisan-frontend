"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store"; // Adjust path to your store
import { updateKYC } from "../store/authSlice"; // Adjust path to your auth slice
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
  const dispatch = useDispatch();

  // Grab the current user from Redux auth state
  const { user } = useSelector((state: RootState) => state.auth);

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

    // Dispatch to Redux instead of local context
    dispatch(
      updateKYC({
        bankAccount: {
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          bankName: formData.bankName,
        },
        kycStatus: "pending",
      }),
    );

    setVerificationPanelOpen(true);
  };

  const handleStartVerification = () => {
    setVerificationPanelOpen(true);
  };

  // Status mapping logic
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
  const isVerified = user?.kycStatus === "verified";

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="overflow-hidden rounded-3xl border border-surface-400/70 bg-white shadow-card">
        <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative bg-gradient-to-br from-white via-[#faf7f2] to-[#eef4f1] px-6 py-7 sm:px-8 sm:py-10 text-ink">
            <div className="absolute inset-0 opacity-100 [background-image:radial-gradient(circle_at_top_right,rgba(209,166,103,0.12),transparent_30%)]" />
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
                  keep your profile ready.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant={status.tone}>{status.label}</Badge>
                <Badge variant={isVerified ? "success" : "warning"}>
                  {isVerified ? "Access enabled" : "Access restricted"}
                </Badge>
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
                          : "text-danger"
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
            </div>
          </div>
        </div>
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
                    Start verification and submit your identity documents.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="sm:flex-1"
                  onClick={handleStartVerification}
                >
                  Start verification
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="sm:flex-1"
                >
                  Save and mark pending
                </Button>
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
              value={formData.accountName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("accountName", e.target.value)
              }
            />
            <Input
              label="Account number"
              inputMode="numeric"
              value={formData.accountNumber}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("accountNumber", e.target.value)
              }
            />
            <Input
              label="Bank name"
              value={formData.bankName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("bankName", e.target.value)
              }
            />

            <Button type="submit" variant="primary" size="lg" fullWidth>
              Submit bank details <ChevronRight className="ml-2" size={18} />
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
