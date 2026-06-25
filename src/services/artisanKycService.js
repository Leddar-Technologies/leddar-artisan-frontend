"use client";

/**
 * Artisan KYC service — mirrors the brand's authService KYC functions.
 * All calls go through apiClient so expired access tokens are silently refreshed.
 */

import apiClient from "./apiClient";

const KYC_PROFILE_KEY = "leddar_artisan_kyc";

// ─── Local cache helpers ─────────────────────────────────────────────────────

function readLocalKyc() {
  if (typeof window === "undefined") return { status: "NOT_STARTED" };
  try {
    const raw = window.localStorage.getItem(KYC_PROFILE_KEY);
    return raw ? JSON.parse(raw) : { status: "NOT_STARTED" };
  } catch {
    return { status: "NOT_STARTED" };
  }
}

function writeLocalKyc(profile) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KYC_PROFILE_KEY, JSON.stringify(profile));
  }
}

export function clearLocalKyc() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(KYC_PROFILE_KEY);
  }
}

// ─── API calls ───────────────────────────────────────────────────────────────

/**
 * Fetch the artisan's current KYC status from the server.
 * Falls back to the cached local value on network/auth error.
 */
export async function getArtisanKycStatus() {
  try {
    const res  = await apiClient.get("/artisans/kyc-status");
    const data = res.data.data || {};

    const statusMap = {
      VERIFIED:    "verified",
      FAILED:      "failed",
      NOT_STARTED: "not_started",
      PENDING:     "pending_review",
    };

    const profile = {
      status:        statusMap[data.status]        || "not_started",
      ninStatus:     statusMap[data.ninStatus]     || null,
      addressStatus: statusMap[data.addressStatus] || null,
      hasAddress:    !!(data.hasAddress),
      hasBankDetails: !!(data.hasBankDetails),
      idType:        data.idType   || null,
      provider:      data.provider || null,
      updatedAt:     new Date().toISOString(),
    };

    writeLocalKyc(profile);
    return profile;
  } catch {
    return readLocalKyc();
  }
}

/**
 * Step 1 — Verify NIN identity via QoreID.
 */
export async function verifyArtisanIdentity({ idNumber, firstname, lastname }) {
  const res = await apiClient.post("/artisans/verify-id", {
    idType: "NIN",
    idNumber,
    firstname,
    lastname,
  });

  const statusMap = {
    VERIFIED: "verified",
    FAILED:   "failed",
    PENDING:  "pending_review",
  };

  const rawStatus = res.data.data?.kycStatus || "FAILED";
  const profile   = {
    status:    statusMap[rawStatus] || "failed",
    idType:    "NIN",
    provider:  "QoreID",
    updatedAt: new Date().toISOString(),
  };

  writeLocalKyc(profile);
  return profile;
}

/**
 * Step 2 — Save business address fields.
 * All of state, workAddress (street), city, lgaName are required by QoreID.
 */
export async function saveArtisanWorkProfile({ state, workAddress, city, lgaName, landmark }) {
  const res = await apiClient.patch("/artisans/profile", {
    state, workAddress, city, lgaName,
    landmark: landmark || undefined,
  });
  return res.data.data;
}

/**
 * Resolve a bank account via Paystack (returns { accountName, accountNumber, bankId }).
 */
export async function resolveBankAccount(accountNumber, bankCode) {
  const res = await apiClient.get("/artisans/bank/resolve", {
    params: { account_number: accountNumber, bank_code: bankCode },
  });
  return res.data.data;
}

/**
 * Step 3 — Save verified bank details for payouts.
 */
export async function saveArtisanBankDetails({ bankName, bankCode, accountName, accountNumber }) {
  const res = await apiClient.put("/artisans/bank-details", {
    bankName,
    bankCode: bankCode || null,
    accountName,
    accountNumber,
  });
  return res.data.data;
}

/**
 * Fetch the Paystack bank list for the dropdown.
 */
export async function fetchArtisanBanks() {
  try {
    const res = await apiClient.get("/artisans/banks");
    return res.data.data || [];
  } catch {
    return [];
  }
}
