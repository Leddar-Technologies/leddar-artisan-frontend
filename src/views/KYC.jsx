"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateProfile } from "../redux/slices/authSlice";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import {
  ShieldCheck, AlertCircle, CheckCircle2, Fingerprint,
  MapPin, CreditCard, ChevronRight, ChevronLeft,
  Lock, RefreshCw, Loader2, Landmark,
} from "lucide-react";
import {
  getArtisanKycStatus,
  verifyArtisanIdentity,
  saveArtisanWorkProfile,
  saveArtisanBankDetails,
  resolveBankAccount,
  fetchArtisanBanks,
  clearLocalKyc,
} from "../services/artisanKycService";

// ─── Constants ───────────────────────────────────────────────────────────────

const NG_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

const STEPS = [
  { id: 1, label: "Identity",         icon: Fingerprint },
  { id: 2, label: "Business Address", icon: MapPin       },
  { id: 3, label: "Bank Details",     icon: CreditCard   },
];

const STATUS_CONFIG = {
  verified: {
    badge: "Verified ✓", Icon: CheckCircle2,
    color: "bg-emerald-50 text-success", border: "border-emerald-200 bg-emerald-50/40",
    headline: "Identity Verified",
    description: "Your NIN is verified. Complete steps 2 & 3 to receive jobs.",
  },
  failed: {
    badge: "Failed", Icon: AlertCircle,
    color: "bg-red-50 text-danger", border: "border-red-200 bg-red-50/40",
    headline: "Verification Failed",
    description: "Your details could not be verified. Check your NIN and try again.",
  },
  pending_review: {
    badge: "Pending Review", Icon: ShieldCheck,
    color: "bg-[#FFF8EA] text-gold", border: "border-[#E8DED5] bg-white",
    headline: "Verification In Review",
    description: "Your identity is being reviewed. You will be notified once approved.",
  },
  not_started: {
    badge: "Not Started", Icon: Lock,
    color: "bg-surface-100 text-neutral-600", border: "border-surface-400 bg-white",
    headline: "Verification Not Started",
    description: "Verify your NIN, address, and bank account to receive jobs and payouts.",
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function KYC() {
  const dispatch = useDispatch();

  const [kycProfile, setKycProfile] = useState({
    status: "not_started", ninStatus: null, addressStatus: null,
    hasAddress: false, hasBankDetails: false,
  });
  const [busy, setBusy]             = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [step, setStep]             = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError]   = useState("");

  // Bank list for Step 3 dropdown
  const [banks, setBanks]               = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);

  // Step 1 — identity (NIN only)
  const [idFields, setIdFields] = useState({ idNumber: "", firstname: "", lastname: "" });

  // Step 2 — business address
  const [state, setState]             = useState("");
  const [workAddress, setWorkAddress] = useState(""); // street
  const [city, setCity]               = useState("");
  const [lgaName, setLgaName]         = useState("");
  const [landmark, setLandmark]       = useState("");

  // Step 3 — bank details with Paystack verification
  const [bankCode, setBankCode]           = useState("");
  const [bankName, setBankName]           = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [verifyState, setVerifyState]     = useState("idle"); // idle | loading | verified | error
  const [resolvedName, setResolvedName]   = useState("");
  const [verifyError, setVerifyError]     = useState("");

  // Load KYC status on mount and whenever the tab regains focus
  // (artisan may have accepted a job in another tab, triggering QoreID check)
  useEffect(() => {
    const fetchStatus = () => {
      getArtisanKycStatus()
        .then((p) => setKycProfile(p || { status: "not_started" }))
        .catch(() => {})
        .finally(() => setBusy(false));
    };
    fetchStatus();
    window.addEventListener("focus", fetchStatus);
    return () => window.removeEventListener("focus", fetchStatus);
  }, []);

  // Fetch banks when modal opens
  useEffect(() => {
    if (modalOpen) {
      setBanksLoading(true);
      fetchArtisanBanks()
        .then((list) => setBanks(list.sort((a, b) => a.name.localeCompare(b.name))))
        .catch(() => {})
        .finally(() => setBanksLoading(false));
    }
  }, [modalOpen]);

  const isNinVerified  = kycProfile.ninStatus === "verified" || kycProfile.status === "verified";
  const allDone        = isNinVerified && kycProfile.hasAddress && kycProfile.hasBankDetails;
  const canVerify      = !allDone;
  const cfg            = STATUS_CONFIG[kycProfile.status] || STATUS_CONFIG.not_started;
  const StatusIcon     = cfg.Icon;

  function openModal() {
    // Jump directly to first incomplete step
    const startStep = !isNinVerified ? 1 : !kycProfile.hasAddress ? 2 : 3;
    setStep(startStep);
    setStepError("");
    setIdFields({ idNumber: "", firstname: "", lastname: "" });
    setState("");
    setWorkAddress("");
    setCity("");
    setLgaName("");
    setLandmark("");
    setBankCode("");
    setBankName("");
    setAccountNumber("");
    resetBankVerification();
    setModalOpen(true);
  }

  function handleRetry() {
    clearLocalKyc();
    setKycProfile({ status: "not_started", ninStatus: null, addressStatus: null, hasAddress: false, hasBankDetails: false });
    setStep(1);
    setStepError("");
    setIdFields({ idNumber: "", firstname: "", lastname: "" });
    setModalOpen(true);
  }

  // ── Bank verification helpers ─────────────────────────────────────────────

  function resetBankVerification() {
    setVerifyState("idle");
    setResolvedName("");
    setVerifyError("");
  }

  function handleBankSelect(e) {
    const code  = e.target.value;
    const found = banks.find((b) => b.code === code);
    setBankCode(code);
    setBankName(found?.name || "");
    resetBankVerification();
    if (accountNumber.length === 10 && code) {
      triggerVerify(accountNumber, code);
    }
  }

  function handleAccountNumberChange(e) {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setAccountNumber(val);
    resetBankVerification();
    if (val.length === 10 && bankCode) {
      triggerVerify(val, bankCode);
    }
  }

  async function triggerVerify(accNum, code) {
    setVerifyState("loading");
    setVerifyError("");
    try {
      const data = await resolveBankAccount(accNum, code);
      setResolvedName(data.accountName);
      setVerifyState("verified");
    } catch (err) {
      setVerifyError(err.response?.data?.message || "Account not found. Check the number and bank.");
      setVerifyState("error");
    }
  }

  // ── Step 1: NIN Identity ──────────────────────────────────────────────────
  async function handleStep1(e) {
    e.preventDefault();
    setStepError("");
    setSubmitting(true);
    try {
      const result = await verifyArtisanIdentity({
        idNumber:  idFields.idNumber.trim(),
        firstname: idFields.firstname.trim(),
        lastname:  idFields.lastname.trim(),
      });

      setKycProfile((p) => ({ ...p, ...result }));
      dispatch(updateProfile({ kycStatus: result.status }));

      if (result.status === "verified" || result.status === "pending_review") {
        setStep(2);
      } else {
        setStepError("NIN could not be verified. Please check your details and try again.");
      }
    } catch (err) {
      setStepError(err.response?.data?.message || err.message || "Verification failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step 2: Business Address ──────────────────────────────────────────────
  async function handleStep2(e) {
    e.preventDefault();
    setStepError("");
    if (!state)              { setStepError("Please select your state."); return; }
    if (!city.trim())        { setStepError("Please enter your city."); return; }
    if (!lgaName.trim())     { setStepError("Please enter your LGA (Local Government Area)."); return; }
    if (!workAddress.trim()) { setStepError("Please enter your street address."); return; }
    setSubmitting(true);
    try {
      await saveArtisanWorkProfile({ state, workAddress, city, lgaName, landmark });
      setKycProfile((p) => ({ ...p, hasAddress: true }));
      setStep(3);
    } catch (err) {
      setStepError(err.response?.data?.message || err.message || "Failed to save address. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step 3: Bank Details ──────────────────────────────────────────────────
  async function handleStep3(e) {
    e.preventDefault();
    setStepError("");
    if (!bankCode)                    { setStepError("Please select your bank."); return; }
    if (accountNumber.length !== 10)  { setStepError("Account number must be 10 digits."); return; }
    if (verifyState !== "verified")   { setStepError("Please verify your account number first."); return; }

    setSubmitting(true);
    try {
      await saveArtisanBankDetails({
        bankName,
        bankCode,
        accountName:   resolvedName,
        accountNumber,
      });
      setKycProfile((p) => ({ ...p, hasBankDetails: true }));
      setModalOpen(false);
      // Refresh full status from server
      getArtisanKycStatus().then((p) => { if (p) setKycProfile(p); });
    } catch (err) {
      setStepError(err.response?.data?.message || err.message || "Failed to save bank details.");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 sm:space-y-8">

      {/* ── Hero status banner ── */}
      <section className="overflow-hidden rounded-3xl border border-surface-400/70 bg-white shadow-card">
        <div className="grid lg:grid-cols-[1.4fr_0.6fr]">
          <div className="relative bg-gradient-to-br from-white via-[#faf7f2] to-[#eef4f1] px-6 py-7 sm:px-8 sm:py-10">
            <div className="absolute inset-0 opacity-100 [background-image:radial-gradient(circle_at_top_right,rgba(209,166,103,0.12),transparent_30%)]" />
            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-leather/10 bg-white px-3 py-1 text-sm font-medium text-leather shadow-sm">
                <ShieldCheck size={16} /> Identity Verification
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
                Verify your identity to activate jobs and payouts
              </h1>
              <p className="max-w-xl text-sm leading-7 text-neutral-700">
                Complete all 3 steps to fully activate your artisan account. Your details are
                verified securely via QoreID and Paystack.
              </p>

              {/* Step chips with live status */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { label: "1. NIN",             done: isNinVerified },
                  { label: "2. Business Address", done: kycProfile.hasAddress },
                  { label: "3. Bank Details",     done: kycProfile.hasBankDetails },
                ].map((s) => (
                  <div key={s.label} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                    s.done
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-surface-400 bg-white text-neutral-600"
                  }`}>
                    {s.done ? <CheckCircle2 size={12} /> : <Lock size={12} />}
                    {s.label}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-2">
                {canVerify && (
                  <Button variant="primary" onClick={openModal} disabled={busy}
                    className="inline-flex items-center gap-2">
                    <ShieldCheck size={16} />
                    {!isNinVerified ? "Start Verification" : !kycProfile.hasAddress ? "Enter Business Address" : "Add Bank Details"}
                    <ChevronRight size={16} />
                  </Button>
                )}
                {kycProfile.status === "failed" && (
                  <Button variant="primary" onClick={handleRetry}
                    className="inline-flex items-center gap-2 mt-2">
                    <RefreshCw size={15} /> Retry NIN Verification
                  </Button>
                )}
                {allDone && (
                  <p className="flex items-center gap-2 text-sm font-medium text-success">
                    <CheckCircle2 size={18} /> Account fully verified — jobs and payouts are active.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status pill */}
          <div className={`flex items-center justify-center p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-surface-400/70 ${cfg.border}`}>
            <div className="text-center space-y-3">
              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${cfg.color}`}>
                <StatusIcon size={30} />
              </div>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${cfg.color}`}>
                {cfg.badge}
              </span>
              <p className="text-xs text-neutral-600 max-w-[160px] leading-5">{cfg.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Physical Address verification info card ── */}
      {(() => {
        const addr = kycProfile.addressStatus;
        const addrVerified      = addr === "verified";
        const addrFailed        = addr === "failed";
        const addrQoreidPending = addr === "qoreid_pending";
        const addrSaved         = addr === "saved";

        const badgeCfg = addrVerified
          ? { cls: "border-emerald-200 bg-emerald-50 text-emerald-700",  label: "Verified ✓" }
          : addrFailed
          ? { cls: "border-red-200 bg-red-50 text-red-700",              label: "Failed" }
          : addrQoreidPending
          ? { cls: "border-blue-200 bg-blue-50 text-blue-700",           label: "QoreID Pending" }
          : addrSaved
          ? { cls: "border-amber-200 bg-amber-50 text-amber-700",        label: "Pending" }
          : { cls: "border-[#E8DED5] bg-[#FFF8EA] text-[#8B6A39]",      label: "Not Entered" };

        const sectionCls = addrVerified
          ? "border-emerald-200 bg-emerald-50/40"
          : addrFailed
          ? "border-red-200 bg-red-50/40"
          : addrQoreidPending
          ? "border-blue-100 bg-blue-50/30"
          : "border-[#E8DED5] bg-white";

        const iconCls = addrVerified
          ? "bg-emerald-50 text-emerald-600"
          : addrFailed
          ? "bg-red-50 text-red-600"
          : addrQoreidPending
          ? "bg-blue-50 text-blue-600"
          : "bg-[#FFF8EA] text-[#8B6A39]";

        const description = addrVerified
          ? "Your business address has been verified by QoreID."
          : addrFailed
          ? "Your address could not be verified. Please contact support or update your address and try again."
          : addrQoreidPending
          ? "A QoreID agent has been dispatched to verify your workplace address. This usually takes 1–2 business days. You'll be notified by email when it's done."
          : addrSaved
          ? "Your address has been saved. It will be sent to QoreID for physical verification when you accept your first job."
          : "Enter your workplace address in Step 2 above. QoreID will verify it physically after you accept your first job.";

        return (
          <section className={`rounded-2xl border px-6 py-5 ${sectionCls}`}>
            <div className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconCls}`}>
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-ink">Physical Address Verification (QoreID)</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${badgeCfg.cls}`}>
                    {badgeCfg.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-600 leading-5">{description}</p>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Trust footer */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 rounded-full border border-surface-400 bg-white px-4 py-2">
          <ShieldCheck className="h-3.5 w-3.5 text-neutral-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
            Secured by QoreID · Paystack · AES-256 Encrypted
          </span>
        </div>
      </div>

      {/* ── 3-Step Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => { if (!submitting) setModalOpen(false); }}
        title={`Step ${step} of 3 — ${STEPS[step - 1]?.label}`}
      >
        <div className="space-y-5">

          {/* Step progress */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = (s.id === 1 && isNinVerified) || (s.id === 2 && kycProfile.hasAddress) || (s.id === 3 && kycProfile.hasBankDetails);
              return (
                <div key={s.id} className="flex flex-1 items-center gap-2">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    done         ? "bg-success text-white"
                    : step === s.id ? "bg-leather text-white"
                    : "bg-surface-200 text-neutral-500"
                  }`}>
                    {done ? <CheckCircle2 size={14} /> : s.id}
                  </div>
                  <span className={`hidden sm:inline text-xs font-medium ${step >= s.id || done ? "text-ink" : "text-neutral-500"}`}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded ${done ? "bg-success" : "bg-surface-400"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── STEP 1: NIN Identity ── */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <p className="text-sm text-neutral-600">
                Enter your details exactly as they appear on your NIN slip or NIMC card.
              </p>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  NIN (11 digits) <span className="text-danger">*</span>
                </label>
                <input
                  className="w-full rounded-xl border border-surface-400 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold transition-all font-mono tracking-wider"
                  required
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="e.g. 12345678901"
                  value={idFields.idNumber}
                  onChange={(e) => setIdFields((p) => ({ ...p, idNumber: e.target.value.replace(/\D/g, "").slice(0, 11) }))}
                />
                <p className="mt-1 text-xs text-neutral-400">{idFields.idNumber.length}/11</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    className="w-full rounded-xl border border-surface-400 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                    required placeholder="As on your NIN"
                    value={idFields.firstname}
                    onChange={(e) => setIdFields((p) => ({ ...p, firstname: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                    Last Name <span className="text-danger">*</span>
                  </label>
                  <input
                    className="w-full rounded-xl border border-surface-400 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                    required placeholder="As on your NIN"
                    value={idFields.lastname}
                    onChange={(e) => setIdFields((p) => ({ ...p, lastname: e.target.value }))}
                  />
                </div>
              </div>

              {stepError && <ErrorBox msg={stepError} />}

              <Button type="submit" variant="primary" fullWidth size="lg" disabled={submitting}>
                {submitting
                  ? <Spinner text="Verifying with QoreID..." />
                  : <span className="flex items-center justify-center gap-2">Verify NIN <ChevronRight size={16} /></span>
                }
              </Button>
            </form>
          )}

          {/* ── STEP 2: Business Address ── */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <p className="text-sm text-neutral-600">
                Enter your workshop or business address. QoreID will verify this location
                when you accept your first job.
              </p>

              {/* State + City row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                    State <span className="text-danger">*</span>
                  </label>
                  <select
                    className="w-full rounded-xl border border-surface-400 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                    required value={state} onChange={(e) => setState(e.target.value)}
                  >
                    <option value="">Select state</option>
                    {NG_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                    City <span className="text-danger">*</span>
                  </label>
                  <input
                    className="w-full rounded-xl border border-surface-400 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                    required placeholder="e.g. Surulere"
                    value={city} onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              {/* LGA */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  LGA (Local Government Area) <span className="text-danger">*</span>
                </label>
                <input
                  className="w-full rounded-xl border border-surface-400 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                  required placeholder="e.g. Surulere"
                  value={lgaName} onChange={(e) => setLgaName(e.target.value)}
                />
              </div>

              {/* Street address */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Street Address <span className="text-danger">*</span>
                </label>
                <input
                  className="w-full rounded-xl border border-surface-400 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                  required placeholder="e.g. 12 Broad Street"
                  value={workAddress} onChange={(e) => setWorkAddress(e.target.value)}
                />
              </div>

              {/* Landmark (optional) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Landmark <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <input
                  className="w-full rounded-xl border border-surface-400 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold transition-all"
                  placeholder="e.g. Near Shoprite, Behind GTBank"
                  value={landmark} onChange={(e) => setLandmark(e.target.value)}
                />
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-700">
                <MapPin size={14} className="shrink-0 mt-0.5" />
                <span>
                  This address is sent to QoreID for physical location verification when you
                  accept your first job. Make sure all fields are accurate.
                </span>
              </div>

              {stepError && <ErrorBox msg={stepError} />}

              <div className="flex gap-3">
                <BackButton onClick={() => { setStep(1); setStepError(""); }} />
                <Button type="submit" variant="primary" fullWidth disabled={submitting}>
                  {submitting
                    ? <Spinner text="Saving..." />
                    : <span className="flex items-center justify-center gap-2">Continue <ChevronRight size={16} /></span>
                  }
                </Button>
              </div>
            </form>
          )}

          {/* ── STEP 3: Bank Details (Paystack verified) ── */}
          {step === 3 && (
            <form onSubmit={handleStep3} className="space-y-4">
              <p className="text-sm text-neutral-600">
                Add your bank account so you can receive payouts for completed jobs.
                Your account number is verified with Paystack before saving.
              </p>

              {/* Bank select */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Bank <span className="text-danger">*</span>
                  {banksLoading && <span className="text-[11px] font-normal text-neutral-400 ml-1">— syncing…</span>}
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-surface-400 bg-surface-100/50 px-3 py-2 mb-2">
                  <Landmark size={15} className="text-neutral-500 shrink-0" />
                  <select
                    className="flex-1 bg-transparent text-sm outline-none text-ink"
                    required
                    value={bankCode}
                    onChange={handleBankSelect}
                  >
                    <option value="">Select your bank</option>
                    {banks.map((b) => (
                      <option key={b.code} value={b.code}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Account number */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                  Account Number <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="10-digit account number"
                    value={accountNumber}
                    onChange={handleAccountNumberChange}
                    maxLength={10}
                    className={`w-full px-4 py-2.5 pr-11 border rounded-xl text-sm outline-none focus:ring-2 transition-colors font-mono tracking-wider ${
                      verifyState === "verified"
                        ? "border-emerald-400 focus:ring-emerald-200 bg-emerald-50"
                        : verifyState === "error"
                        ? "border-red-400 focus:ring-red-100 bg-red-50"
                        : "border-surface-400 focus:ring-gold/30 focus:border-gold"
                    }`}
                    required
                  />
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                    {verifyState === "loading"  && <Loader2 className="h-4 w-4 animate-spin text-gold" />}
                    {verifyState === "verified" && <ShieldCheck className="h-4 w-4 text-emerald-600" />}
                    {verifyState === "error"    && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
                <p className="mt-1 text-xs text-neutral-400">
                  {accountNumber.length}/10
                  {!bankCode && accountNumber.length > 0 && (
                    <span className="ml-2 text-amber-600">— select a bank first</span>
                  )}
                </p>
              </div>

              {/* Verification feedback */}
              {verifyState === "loading" && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  Verifying account with Paystack…
                </div>
              )}
              {verifyState === "verified" && resolvedName && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Account Verified ✓</p>
                    <p className="text-base font-bold text-stone-900">{resolvedName}</p>
                  </div>
                </div>
              )}
              {verifyState === "error" && verifyError && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {verifyError}
                </div>
              )}

              {/* Retry */}
              {verifyState !== "verified" && verifyState !== "loading" &&
                accountNumber.length === 10 && bankCode && (
                <button
                  type="button"
                  onClick={() => triggerVerify(accountNumber, bankCode)}
                  className="text-sm font-semibold text-leather underline underline-offset-2 hover:text-espresso"
                >
                  Retry verification
                </button>
              )}

              {stepError && <ErrorBox msg={stepError} />}

              <div className="flex gap-3">
                <BackButton onClick={() => { setStep(2); setStepError(""); }} />
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={submitting || verifyState !== "verified"}
                >
                  {submitting
                    ? <Spinner text="Saving..." />
                    : <span className="flex items-center justify-center gap-2">Complete Setup <CheckCircle2 size={16} /></span>
                  }
                </Button>
              </div>
            </form>
          )}

        </div>
      </Modal>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-surface-400 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-surface-100 hover:text-ink transition-colors"
    >
      <ChevronLeft size={15} /> Back
    </button>
  );
}

function ErrorBox({ msg }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-danger">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}

function Spinner({ text }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />{text}
    </span>
  );
}
