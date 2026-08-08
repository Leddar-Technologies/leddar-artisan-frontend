"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateArtisanProfile } from "../redux/slices/authSlice";
import apiClient from "../services/apiClient";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "../components/ui/Card";
import Input from "../components/ui/Input";
import PhoneInput from "../components/ui/PhoneInput";
import Badge from "../components/ui/Badge";
import {
  User, Building2, Loader2, CheckCircle2, AlertCircle,
  ShieldCheck, MapPin, Briefcase, Fingerprint, Image as ImageIcon,
} from "lucide-react";

const SPECIALTY_LABEL = {
  SHOES_AND_BOOTS:        "Shoes & Boots",
  SLIPPERS_AND_SANDALS:   "Slippers & Sandals",
  WOMEN_BAGS:             "Women Bags",
  OFFICE_AND_TRAVEL_BAGS: "Office & Travel Bags",
  WALLETS_AND_BELTS:      "Wallets & Belts",
  SMALL_LEATHER_GOODS:    "Small Leather Goods",
  LEATHER_WEARS:          "Leather Wears",
  OTHERS:                 "Others",
};

const PRODUCES_FOR_LABEL = { MALE: "Male Wear", FEMALE: "Female Wear", UNISEX: "Unisex / Both" };

const KYC_BADGE_VARIANT = {
  VERIFIED:     "success",
  IN_PROGRESS:  "warning",
  PENDING:      "warning",
  FAILED:       "danger",
  NOT_VERIFIED: "danger",
};

const maskTail = (value, visible = 4) => {
  if (!value) return null;
  const str = String(value);
  if (str.length <= visible) return str;
  return "•".repeat(str.length - visible) + str.slice(-visible);
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" }) : "—";

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-stone-900">{value ?? "—"}</p>
    </div>
  );
}

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    fullName:    user?.fullName    || "",
    specialty:   user?.specialty   || "",
    producesFor: user?.producesFor || "",
    whatsapp:    user?.whatsapp    || "",
  });

  const [profileSaving, setProfileSaving]   = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError]     = useState("");

  // Full profile — everything the app has actually collected, fetched fresh
  // from the server rather than relying on the sparse login payload in redux.
  const [fullProfile, setFullProfile] = useState(null);
  const [fullProfileLoading, setFullProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName:    user.fullName    || "",
        specialty:   user.specialty   || "",
        producesFor: user.producesFor || "",
        whatsapp:    user.whatsapp    || "",
      });
    }
  }, [user]);

  useEffect(() => {
    setFullProfileLoading(true);
    apiClient.get("/artisans/me")
      .then((res) => {
        const data = res.data.data;
        setFullProfile(data);
        // Prefer the authoritative fetched profile to seed the edit form
        setProfileData({
          fullName:    data.fullName    || "",
          specialty:   Array.isArray(data.specialty) ? data.specialty[0] || "" : data.specialty || "",
          producesFor: data.producesFor || "",
          whatsapp:    data.whatsapp    || "",
        });
      })
      .catch(() => {/* fall back silently to redux user data already seeded above */})
      .finally(() => setFullProfileLoading(false));
  }, []);

  const handleProfileChange = (field, value) =>
    setProfileData((p) => ({ ...p, [field]: value }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess(false);
    try {
      await dispatch(updateArtisanProfile(profileData)).unwrap();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err) {
      setProfileError(typeof err === "string" ? err : "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const specialties = Array.isArray(fullProfile?.specialty) ? fullProfile.specialty : [];
  const kyc = fullProfile?.user?.kyc || null;
  const bank = fullProfile?.bankDetail || null;
  const portfolio = fullProfile?.portfolio || [];

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
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-stone-500 mb-1">Full Name</p>
                <p className="text-sm font-bold text-stone-900">{fullProfile?.fullName || user?.fullName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Email</p>
                <p className="text-sm font-bold text-stone-900">{fullProfile?.user?.email || user?.email || "—"}</p>
              </div>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-xs text-stone-500 mb-1">Account Status</p>
                <p className="text-sm font-bold text-stone-900">{fullProfile?.user?.status || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 mb-1">Member Since</p>
                <p className="text-sm font-bold text-stone-900">
                  {fullProfile?.user?.createdAt ? formatDate(fullProfile.user.createdAt) : (fullProfile?.createdAt ? formatDate(fullProfile.createdAt) : "—")}
                </p>
              </div>
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
                  {Object.entries(SPECIALTY_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Who do you produce for?</label>
                <select
                  value={profileData.producesFor}
                  onChange={(e) => handleProfileChange("producesFor", e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg outline-none"
                >
                  <option value="">Select category</option>
                  {Object.entries(PRODUCES_FOR_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {profileError && <p className="text-sm text-red-500">{profileError}</p>}
            {profileSuccess && (
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Profile saved successfully.
              </p>
            )}
          </CardContent>
        </Card>
      </form>

      {/* ── Everything the app has collected — read-only ─────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase size={20} /> Work Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fullProfileLoading ? (
            <p className="text-sm text-stone-500 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading collected information…</p>
          ) : (
            <>
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-500 mb-1.5">Specialties</p>
                {specialties.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {specialties.map((s) => (
                      <span key={s} className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        {SPECIALTY_LABEL[s] || s}
                      </span>
                    ))}
                  </div>
                ) : <p className="text-sm text-stone-400">—</p>}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <InfoRow label="Produces For" value={PRODUCES_FOR_LABEL[fullProfile?.producesFor] || fullProfile?.producesFor} />
                <InfoRow label="Weekly Capacity" value={fullProfile?.capacityPerWeek ? `${fullProfile.capacityPerWeek} units/week` : null} />
                <InfoRow label="Team Size" value={fullProfile?.numberOfWorkers ? `${fullProfile.numberOfWorkers} worker(s)` : null} />
              </div>
              {fullProfile?.bio && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-stone-500 mb-1">Bio</p>
                  <p className="text-sm text-stone-700">{fullProfile.bio}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {portfolio.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ImageIcon size={20} /> Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {portfolio.map((p, i) => (
                <img key={p.id || i} src={p.file?.url} className="h-24 w-full rounded-lg object-cover" alt="" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin size={20} /> Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <InfoRow label="Work Address" value={fullProfile?.workAddress} />
            <InfoRow label="Landmark" value={fullProfile?.landmark} />
            <InfoRow label="Local Government Area" value={fullProfile?.lgaName} />
            <InfoRow label="State" value={fullProfile?.state} />
            <InfoRow label="City" value={fullProfile?.city} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Fingerprint size={20} /> Identity Verification (KYC)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <p className="text-xs uppercase tracking-wide text-stone-500">Overall Status</p>
            <Badge variant={KYC_BADGE_VARIANT[kyc?.status] || "warning"}>{kyc?.status || "NOT_STARTED"}</Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <InfoRow label="ID Type" value={kyc?.idType} />
            <InfoRow label="Verified On" value={kyc?.verifiedAt ? formatDate(kyc.verifiedAt) : null} />
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-stone-800">NIN Verification</p>
              <Badge variant={KYC_BADGE_VARIANT[kyc?.ninStatus] || "warning"}>{kyc?.ninStatus || "PENDING"}</Badge>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <InfoRow label="Name on NIN" value={[kyc?.ninFirstName, kyc?.ninLastName].filter(Boolean).join(" ") || null} />
              <InfoRow label="NIN Number" value={maskTail(kyc?.ninNumber)} />
              <InfoRow label="Verified On" value={kyc?.ninVerifiedAt ? formatDate(kyc.ninVerifiedAt) : null} />
            </div>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-stone-800">Address Verification</p>
              <Badge variant={KYC_BADGE_VARIANT[kyc?.addressStatus] || "warning"}>{kyc?.addressStatus || "PENDING"}</Badge>
            </div>
            <InfoRow label="Verified On" value={kyc?.addressVerifiedAt ? formatDate(kyc.addressVerifiedAt) : null} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 size={20} /> Bank Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bank ? (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    {bank.isVerified ? "Account Verified ✓" : "Account on file"}
                  </p>
                  <p className="text-base font-bold text-stone-900">{bank.accountName}</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <InfoRow label="Bank" value={bank.bankName} />
                <InfoRow label="Account Number" value={maskTail(bank.accountNumber, 4)} />
              </div>
            </>
          ) : (
            <p className="text-sm text-stone-500">No bank account on file yet.</p>
          )}
          <p className="text-xs text-stone-400">To add or change your payout account, use the Bank Details page in the sidebar.</p>
        </CardContent>
      </Card>
    </div>
  );
}
