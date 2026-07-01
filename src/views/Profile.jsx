"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../redux/slices/authSlice";
import apiClient from "../services/apiClient";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import PhoneInput from "../components/ui/PhoneInput";
import Badge from "../components/ui/Badge";
import {
  User, Building2, Save, Upload, Loader2, CheckCircle2, AlertCircle, ShieldCheck,
} from "lucide-react";


export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    fullName:  user?.fullName  || "",
    specialty: user?.specialty || "",
    whatsapp:  user?.whatsapp  || "",
  });

  const [bankData, setBankData] = useState({
    bankName:      user?.bankAccount?.bankName      || "",
    bankCode:      user?.bankAccount?.bankCode      || "",
    accountName:   user?.bankAccount?.accountName   || "",
    accountNumber: user?.bankAccount?.accountNumber || "",
  });

  // Account verification state
  const [verifyState, setVerifyState] = useState(
    // If user already has saved bank details, treat as pre-verified
    user?.bankAccount?.accountName ? "verified" : "idle",
  );
  const [resolvedName, setResolvedName] = useState(user?.bankAccount?.accountName || "");
  const [verifyError, setVerifyError]   = useState("");

  const [banks, setBanks]           = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);
  const [bankSuccess, setBankSuccess] = useState(false);
  const [bankError, setBankError]   = useState("");

  const [portfolioImages, setPortfolioImages] = useState(user?.portfolioImages || []);
  const [portfolioError, setPortfolioError]   = useState("");

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName:  user.fullName  || "",
        specialty: user.specialty || "",
        whatsapp:  user.whatsapp  || "",
      });
      const savedAccount = user.bankAccount?.accountName || "";
      setBankData({
        bankName:      user.bankAccount?.bankName      || "",
        bankCode:      user.bankAccount?.bankCode      || "",
        accountName:   savedAccount,
        accountNumber: user.bankAccount?.accountNumber || "",
      });
      // Treat already-saved bank details as pre-verified
      if (savedAccount) {
        setVerifyState("verified");
        setResolvedName(savedAccount);
      }
      setPortfolioImages(user.portfolioImages || []);
    }
  }, [user]);

  // Load bank list from Paystack via backend
  useEffect(() => {
    setBanksLoading(true);
    apiClient.get("/artisans/banks", {
    })
      .then((res) => setBanks(res.data.data || []))
      .catch(() => {/* silently fail — artisan can type manually */})
      .finally(() => setBanksLoading(false));
  }, []);

  const handleProfileChange = (field, value) =>
    setProfileData((p) => ({ ...p, [field]: value }));

  const handleBankChange = (field, value) => {
    setBankData((p) => ({ ...p, [field]: value }));
    if (field === "bankCode") {
      // Auto-fill bankName when selecting from dropdown; reset verification
      const found = banks.find((b) => b.code === value);
      if (found) setBankData((p) => ({ ...p, bankCode: value, bankName: found.name }));
      resetVerification();
    }
    if (field === "accountNumber") {
      resetVerification();
    }
  };

  const resetVerification = () => {
    setVerifyState("idle");
    setResolvedName("");
    setVerifyError("");
  };

  // Auto-verify when account number is exactly 10 digits and bank is selected
  const handleAccountNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10); // digits only, max 10
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
      const res = await apiClient.get("/artisans/bank/resolve", {
        params: { account_number: accountNumber, bank_code: bankCode },
      });
      const name = res.data.data.accountName;
      setResolvedName(name);
      setBankData((p) => ({ ...p, accountName: name }));
      setVerifyState("verified");
    } catch (err) {
      setVerifyError(err.response?.data?.message || "Account not found. Check the number and bank.");
      setVerifyState("error");
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile({ ...profileData, portfolioImages }));
  };

  const handlePortfolioChange = async (e) => {
    setPortfolioError("");
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (files.length + portfolioImages.length > 4) {
      setPortfolioError("Maximum 4 images allowed");
      return;
    }
    const valid = files.filter((f) => {
      if (!["image/jpeg", "image/png"].includes(f.type)) {
        setPortfolioError("Only JPG and PNG formats are allowed");
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        setPortfolioError("Each image must be less than 5MB");
        return false;
      }
      return true;
    });
    if (valid.length !== files.length) return;
    const urls = await Promise.all(valid.map((f) =>
      new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = () => rej(new Error("Could not read file"));
        r.readAsDataURL(f);
      })
    ));
    setPortfolioImages((prev) => [...prev, ...urls]);
  };

  const removePortfolioImage = (i) => {
    const remaining = portfolioImages.filter((_, idx) => idx !== i);
    setPortfolioImages(remaining);
    if (remaining.length >= 3) setPortfolioError("");
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    if (!bankData.bankCode) {
      setBankError("Please select your bank.");
      return;
    }
    if (!bankData.accountNumber) {
      setBankError("Please enter your account number.");
      return;
    }
    if (verifyState !== "verified") {
      setBankError("Please verify your account number before saving.");
      return;
    }
    setBankSaving(true);
    setBankError("");
    setBankSuccess(false);
    try {
      await apiClient.put("/artisans/bank-details", bankData);
      setBankSuccess(true);
      setTimeout(() => setBankSuccess(false), 4000);
    } catch (err) {
      setBankError(err.response?.data?.message || "Failed to save bank details.");
    } finally {
      setBankSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Profile & Settings</h1>
        <p className="text-stone-600 mt-1">Manage your account information</p>
      </div>

      {/* Profile header card */}
      <Card className="bg-gradient-to-r from-amber-50 to-stone-50 border-l-4 border-l-amber-700">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-stone-900 text-lg">{user?.fullName}</h3>
              <p className="text-sm text-stone-600 mt-1">{user?.email}</p>
              <p className="text-sm text-stone-600">{user?.specialty}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">KYC Status</p>
              <Badge variant={
                user?.kycStatus === "verified" ? "success"
                : user?.kycStatus === "pending" ? "warning"
                : "danger"
              }>
                {user?.kycStatus || "Not Verified"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal info form */}
      <form onSubmit={handleProfileSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User size={20} /> Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileData.fullName}
                onChange={(e) => handleProfileChange("fullName", e.target.value)}
              />
              <PhoneInput
                label="WhatsApp Number"
                value={profileData.whatsapp}
                onChange={(e) => handleProfileChange("whatsapp", e.target.value)}
                name="whatsapp"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Skill/Specialty</label>
                <select
                  value={profileData.specialty}
                  onChange={(e) => handleProfileChange("specialty", e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg outline-none"
                >
                  <option value="">Select specialty</option>
                  <option value="SHOES_AND_BOOTS">Shoes &amp; Boots</option>
                  <option value="SLIPPERS_AND_SANDALS">Slippers &amp; Sandals</option>
                  <option value="WOMEN_BAGS">Women Bags</option>
                  <option value="OFFICE_AND_TRAVEL_BAGS">Office &amp; Travel Bags</option>
                  <option value="WALLETS_AND_BELTS">Wallets &amp; Belts</option>
                  <option value="SMALL_LEATHER_GOODS">Small Leather Goods</option>
                  <option value="LEATHER_WEARS">Leather Wears</option>
                  <option value="OTHERS">Others</option>
                </select>
              </div>
            </div>

            {/* Portfolio */}
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <div className="mb-3 border-2 border-dashed border-stone-300 rounded-xl p-4 text-center">
                <input id="p-upload" type="file" accept="image/*" multiple onChange={handlePortfolioChange} className="hidden" />
                <label htmlFor="p-upload" className="cursor-pointer">
                  <Upload className="mx-auto mb-2 text-stone-500" size={24} />
                  <p className="text-sm font-medium">Upload portfolio images</p>
                </label>
              </div>
              {portfolioError && <p className="text-xs text-red-500 mb-2">{portfolioError}</p>}
              <div className="grid grid-cols-4 gap-3">
                {portfolioImages.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} className="h-24 w-full rounded-lg object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => removePortfolioImage(i)}
                      className="absolute top-0 right-0 bg-red-600 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" variant="primary" className="ml-auto flex items-center gap-2">
              <Save size={18} /> Save Profile
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Bank details form */}
      <form onSubmit={handleBankSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 size={20} /> Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-stone-600">
              Required for receiving payments. Your account number is verified with Paystack before saving.
            </p>

            {/* Bank dropdown */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Bank {banksLoading && <span className="text-xs text-stone-400 ml-1">(loading...)</span>}
              </label>
              {banks.length > 0 ? (
                <select
                  value={bankData.bankCode}
                  onChange={(e) => handleBankChange("bankCode", e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700"
                  required
                >
                  <option value="">Select bank</option>
                  {banks.map((b) => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
              ) : (
                <Input
                  label=""
                  placeholder="e.g. GTBank"
                  value={bankData.bankName}
                  onChange={(e) => handleBankChange("bankName", e.target.value)}
                />
              )}
            </div>

            {/* Account Number — digits only, auto-verifies at 10 digits */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
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
                  className={`w-full px-4 py-2 pr-10 border rounded-lg outline-none focus:ring-2 transition-colors ${
                    verifyState === "verified"
                      ? "border-emerald-400 focus:ring-emerald-200 bg-emerald-50"
                      : verifyState === "error"
                      ? "border-red-400 focus:ring-red-100"
                      : "border-stone-300 focus:ring-amber-700/20 focus:border-amber-700"
                  }`}
                  required
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  {verifyState === "loading" && (
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  )}
                  {verifyState === "verified" && (
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  )}
                  {verifyState === "error" && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              <p className="mt-1 text-xs text-stone-400">
                {bankData.accountNumber.length}/10 digits
                {!bankData.bankCode && bankData.accountNumber.length > 0 && (
                  <span className="ml-2 text-amber-600">— select a bank first</span>
                )}
              </p>
            </div>

            {/* Verification result */}
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
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Account Verified ✓</p>
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

            {/* Manual verify button — fallback if auto-verify didn't fire */}
            {verifyState !== "verified" && verifyState !== "loading" && bankData.accountNumber.length === 10 && bankData.bankCode && (
              <button
                type="button"
                onClick={() => verifyAccount(bankData.accountNumber, bankData.bankCode)}
                className="text-sm font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-800"
              >
                Retry verification
              </button>
            )}

            {bankError && <p className="text-sm text-red-500">{bankError}</p>}
            {bankSuccess && (
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Bank details saved successfully.
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={bankSaving || verifyState !== "verified"}
              className="ml-auto flex items-center gap-2"
            >
              {bankSaving
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                : <><Save size={18} /> Save Bank Details</>
              }
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
