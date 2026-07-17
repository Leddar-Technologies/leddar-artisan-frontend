"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../redux/slices/authSlice";
import apiClient from "../services/apiClient";
import Modal from "../components/ui/Modal";
import {
  Save, Loader2, CheckCircle2, AlertCircle,
  ShieldCheck, Landmark, Info,
} from "lucide-react";

// Comprehensive fallback list — shown immediately, replaced by live Paystack data when available
const NIGERIAN_BANKS = [
  { name: "Access Bank",                    code: "044" },
  { name: "Citibank Nigeria",               code: "023" },
  { name: "Ecobank Nigeria",                code: "050" },
  { name: "Fidelity Bank",                  code: "070" },
  { name: "First Bank of Nigeria",          code: "011" },
  { name: "First City Monument Bank (FCMB)",code: "214" },
  { name: "Globus Bank",                    code: "00103" },
  { name: "Guaranty Trust Bank (GTBank)",   code: "058" },
  { name: "Heritage Bank",                  code: "030" },
  { name: "Keystone Bank",                  code: "082" },
  { name: "Kuda Microfinance Bank",         code: "50211" },
  { name: "Moniepoint Microfinance Bank",   code: "50515" },
  { name: "Opay (OPay Digital Services)",   code: "100004" },
  { name: "Palmpay",                        code: "999991" },
  { name: "Polaris Bank",                   code: "076" },
  { name: "Providus Bank",                  code: "101" },
  { name: "Stanbic IBTC Bank",              code: "221" },
  { name: "Standard Chartered Bank",        code: "068" },
  { name: "Sterling Bank",                  code: "232" },
  { name: "Titan Trust Bank",               code: "102" },
  { name: "Union Bank of Nigeria",          code: "032" },
  { name: "United Bank for Africa (UBA)",   code: "033" },
  { name: "Unity Bank",                     code: "215" },
  { name: "VFD Microfinance Bank",          code: "566" },
  { name: "Wema Bank",                      code: "035" },
  { name: "Zenith Bank",                    code: "057" },
].sort((a, b) => a.name.localeCompare(b.name));

export default function BankDetails() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [bankData, setBankData] = useState({
    bankName:      "",
    bankCode:      "",
    accountName:   "",
    accountNumber: "",
  });

  const [banks, setBanks]               = useState(NIGERIAN_BANKS); // start with hardcoded list
  const [banksLoading, setBanksLoading] = useState(false);

  const [verifyState, setVerifyState]   = useState("idle"); // idle | loading | verified | error
  const [resolvedName, setResolvedName] = useState("");
  const [verifyError, setVerifyError]   = useState("");

  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved]         = useState(false);
  const [dbDetail, setDbDetail]   = useState(null);   // loaded from DB
  const [fetching, setFetching]   = useState(true);   // initial DB fetch
  const [otpModal, setOtpModal]   = useState({ open: false, otp: "", error: "" });

  // Fetch saved bank details from DB on mount
  useEffect(() => {
    setFetching(true);
    apiClient.get("/artisans/bank-details")
      .then((res) => {
        const detail = res.data.data;
        if (detail) {
          setDbDetail(detail);
          setBankData({
            bankName:      detail.bankName      || "",
            bankCode:      detail.bankCode      || "",
            accountName:   detail.accountName   || "",
            accountNumber: detail.accountNumber || "",
          });
          setVerifyState("verified");
          setResolvedName(detail.accountName || "");
        }
      })
      .catch(() => { /* no detail saved yet — leave form empty */ })
      .finally(() => setFetching(false));
  }, []);

  // Try to upgrade the bank list from Paystack (more complete + up-to-date)
  // Falls back silently to NIGERIAN_BANKS if the API call fails
  useEffect(() => {
    setBanksLoading(true);
    apiClient.get("/artisans/banks")
      .then((res) => {
        const live = res.data.data || [];
        if (live.length > 0) setBanks(live.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => { /* keep hardcoded list — no action needed */ })
      .finally(() => setBanksLoading(false));
  }, []);

  const resetVerification = () => {
    setVerifyState("idle");
    setResolvedName("");
    setVerifyError("");
    setBankData((p) => ({ ...p, accountName: "" }));
  };

  const handleBankSelect = (e) => {
    const code  = e.target.value;
    const found = banks.find((b) => b.code === code);
    setBankData((p) => ({ ...p, bankCode: code, bankName: found?.name || "" }));
    resetVerification();
    // Auto-trigger verify if account number is already filled
    if (bankData.accountNumber.length === 10 && code) {
      verifyAccount(bankData.accountNumber, code);
    }
  };

  const handleAccountNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setBankData((p) => ({ ...p, accountNumber: val }));
    resetVerification();
    if (val.length === 10 && bankData.bankCode) {
      verifyAccount(val, bankData.bankCode);
    }
  };

  const verifyAccount = async (accountNumber, bankCode) => {
    setVerifyState("loading");
    setVerifyError("");
    try {
      const res  = await apiClient.get("/artisans/bank/resolve", {
        params: { account_number: accountNumber, bank_code: bankCode },
      });
      const name = res.data.data.accountName;
      setResolvedName(name);
      setBankData((p) => ({ ...p, accountName: name }));
      setVerifyState("verified");
    } catch (err) {
      setVerifyError(
        err.response?.data?.message || "Account not found. Check the number and bank."
      );
      setVerifyState("error");
    }
  };

  const applySavedAccount = () => {
    // Update local DB-fetched state so the saved card shows immediately
    const savedAccount = {
      bankName:      bankData.bankName,
      bankCode:      bankData.bankCode,
      accountName:   bankData.accountName,
      accountNumber: bankData.accountNumber,
    };
    setDbDetail(savedAccount);

    // Keep Redux + localStorage in sync too
    dispatch(updateProfile({ bankAccount: savedAccount }));
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("user") || "null");
      if (stored) {
        stored.bankAccount = savedAccount;
        localStorage.setItem("user", JSON.stringify(stored));
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bankData.bankCode) { setSaveError("Please select your bank."); return; }
    if (bankData.accountNumber.length !== 10) { setSaveError("Account number must be 10 digits."); return; }
    if (verifyState !== "verified") { setSaveError("Please verify your account number first."); return; }

    setSaving(true); setSaveError(""); setSaved(false);
    try {
      const res = await apiClient.put("/artisans/bank-details", bankData);
      if (res.data.requiresOtp) {
        setOtpModal({ open: true, otp: "", error: "" });
      } else {
        applySavedAccount();
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save bank details.");
    } finally {
      setSaving(false);
    }
  };

  const handleOtpConfirm = async () => {
    if (!otpModal.otp.trim()) {
      setOtpModal((p) => ({ ...p, error: "Enter the OTP from your email." }));
      return;
    }
    setSaving(true);
    setOtpModal((p) => ({ ...p, error: "" }));
    try {
      const res = await apiClient.put("/artisans/bank-details", { ...bankData, otp: otpModal.otp.trim() });
      if (res.data.requiresOtp) {
        setOtpModal((p) => ({ ...p, error: "Still awaiting confirmation — request a new OTP and try again." }));
        return;
      }
      setOtpModal({ open: false, otp: "", error: "" });
      applySavedAccount();
    } catch (err) {
      setOtpModal((p) => ({ ...p, error: err.response?.data?.message || "Incorrect OTP." }));
    } finally {
      setSaving(false);
    }
  };

  const hasExisting = !!dbDetail?.accountName;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Bank Details</h1>
        <p className="text-stone-500 mt-1">
          Your bank account for receiving payments from Leddar.
        </p>
      </div>

      {/* Loading skeleton while fetching from DB */}
      {fetching && (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-6 animate-pulse space-y-3">
          <div className="h-3 w-32 rounded bg-stone-200" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 rounded bg-stone-200" />
            <div className="h-4 rounded bg-stone-200" />
            <div className="col-span-2 h-4 rounded bg-stone-200" />
          </div>
        </div>
      )}

      {/* Saved details card — shown once bank account exists */}
      {!fetching && hasExisting ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-100 bg-emerald-100/60">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-bold text-emerald-800">Bank account on file</p>
          </div>
          <div className="grid grid-cols-2 gap-4 px-4 py-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Bank</p>
              <p className="text-sm font-semibold text-stone-900 mt-0.5">{dbDetail?.bankName}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Account Number</p>
              <p className="text-sm font-semibold text-stone-900 font-mono mt-0.5">{dbDetail?.accountNumber}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Account Name</p>
              <p className="text-sm font-semibold text-stone-900 mt-0.5">{dbDetail?.accountName}</p>
            </div>
          </div>
          <p className="px-4 pb-3 text-xs text-emerald-600">
            To update, fill in the form below and save again.
          </p>
        </div>
      ) : !fetching && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">No bank account saved yet</p>
            <p className="text-sm text-amber-700 mt-0.5">
              You must add your bank details before the admin can release payments to you.
            </p>
          </div>
        </div>
      )}

      {/* Dev-mode test helper */}
      {process.env.NODE_ENV !== "production" && (
        <div className="flex items-center justify-between rounded-xl border border-dashed border-violet-300 bg-violet-50 px-4 py-3">
          <div>
            <p className="text-xs font-bold text-violet-700 uppercase tracking-wide">Dev mode</p>
            <p className="text-xs text-violet-600 mt-0.5">
              Account <strong>0000000001</strong> resolves without hitting Paystack
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setBankData({ bankCode: "058", bankName: "Guaranty Trust Bank (GTBank)", accountNumber: "0000000001", accountName: "" });
              resetVerification();
              setTimeout(() => verifyAccount("0000000001", "058"), 100);
            }}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
          >
            Fill test data
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <div className="p-2 rounded-lg bg-amber-50">
            <Landmark className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <p className="text-sm font-bold text-stone-900">Payment Bank Account</p>
            <p className="text-xs text-stone-500">Nigerian bank account only</p>
          </div>
        </div>

        {/* Bank select */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1.5">
            Bank
            {banksLoading && <span className="text-xs font-normal text-stone-400 ml-1">— syncing with Paystack…</span>}
          </label>
          <select
            value={bankData.bankCode}
            onChange={handleBankSelect}
            className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 bg-white"
            required
          >
            <option value="">Select your bank</option>
            {banks.map((b, i) => (
              <option key={b.id ?? `${b.code}-${i}`} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Account number */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1.5">
            Account Number
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="10-digit account number"
              value={bankData.accountNumber}
              onChange={handleAccountNumberChange}
              maxLength={10}
              className={`w-full px-4 py-2.5 pr-11 border rounded-xl text-sm outline-none focus:ring-2 transition-colors ${
                verifyState === "verified"
                  ? "border-emerald-400 focus:ring-emerald-200 bg-emerald-50"
                  : verifyState === "error"
                  ? "border-red-400 focus:ring-red-100 bg-red-50"
                  : "border-stone-300 focus:ring-amber-700/20 focus:border-amber-700"
              }`}
              required
            />
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
              {verifyState === "loading"  && <Loader2 className="h-4 w-4 animate-spin text-amber-600" />}
              {verifyState === "verified" && <ShieldCheck className="h-4 w-4 text-emerald-600" />}
              {verifyState === "error"    && <AlertCircle className="h-4 w-4 text-red-500" />}
            </div>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            {bankData.accountNumber.length}/10
            {!bankData.bankCode && bankData.accountNumber.length > 0 && (
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

        {/* Retry button */}
        {verifyState !== "verified" && verifyState !== "loading" &&
          bankData.accountNumber.length === 10 && bankData.bankCode && (
          <button
            type="button"
            onClick={() => verifyAccount(bankData.accountNumber, bankData.bankCode)}
            className="text-sm font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900"
          >
            Retry verification
          </button>
        )}

        {/* Save feedback */}
        {saveError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {saveError}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> Bank details saved successfully.
          </div>
        )}

        <button
          type="submit"
          disabled={saving || verifyState !== "verified"}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-700 px-4 py-3 text-sm font-bold text-white hover:bg-amber-800 disabled:opacity-50 transition-colors"
        >
          {saving
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            : <><Save className="h-4 w-4" /> Save Bank Details</>
          }
        </button>
      </form>

      {/* Info box */}
      <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-600">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-stone-400" />
        <p>
          Your account number is verified directly with Paystack before saving.
          Changes are confirmed with a one-time code sent to your email.
          Payments are released by the Leddar admin after each completed job stage.
        </p>
      </div>

      {/* OTP confirmation modal */}
      <Modal
        title="Confirm Bank Details Change"
        open={otpModal.open}
        onClose={() => setOtpModal({ open: false, otp: "", error: "" })}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              Check your email for a 6-digit code and enter it below to confirm this change.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1.5">
              One-Time Password (OTP)
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              value={otpModal.otp}
              onChange={(e) => setOtpModal((p) => ({ ...p, otp: e.target.value.replace(/\D/g, "") }))}
              placeholder="e.g. 123456"
              className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3.5 text-center text-2xl font-extrabold tracking-[0.5em] text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 transition"
            />
          </div>

          {otpModal.error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" /> {otpModal.error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleOtpConfirm}
              disabled={saving || otpModal.otp.length < 4}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-700 py-3 text-sm font-bold text-white hover:bg-amber-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              {saving
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</>
                : <><CheckCircle2 className="h-4 w-4" /> Confirm OTP</>
              }
            </button>
            <button
              onClick={() => setOtpModal({ open: false, otp: "", error: "" })}
              className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-900 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
