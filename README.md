# Leddar — Artisan Dashboard

The artisan-facing web application for the Leddar premium leather production platform. Artisans manage sample and production jobs, upload videos, track earnings, and receive payments via Paystack.

**URL:** http://localhost:3005

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (Pages Router) |
| Language | TypeScript |
| State Management | Redux Toolkit |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| HTTP Client | Axios |

---

## Getting Started

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3005 |
| `npm run build` | Build for production |
| `npm start` | Start production server on port 3005 |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type check (no emit) |

---

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## Project Structure

```
src/
├── views/
│   ├── Dashboard.jsx          # Overview: stats, KYC progress tracker, active jobs
│   ├── Jobs.jsx               # Job list grouped by order (sample + production)
│   ├── JobDetails.jsx         # Job detail: specs, video upload, status pipeline, earnings
│   ├── KYC.jsx                # 3-step identity verification flow
│   ├── Payments.jsx           # Earnings dashboard + payment history + receipt download
│   ├── BankDetails.jsx        # Bank account management
│   └── Profile.jsx            # Profile settings
│
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Badge.jsx
│   │   ├── Card.jsx
│   │   └── StatCard.jsx
│   └── layout/
│       ├── Sidebar.jsx
│       └── Topbar.jsx
│
├── redux/
│   └── slices/
│       ├── authSlice.js       # Login, logout, token refresh
│       └── jobsSlice.js       # Fetch jobs, accept/decline, advance status, video upload
│
└── services/
    ├── apiClient.ts           # Axios instance with JWT interceptors
    └── artisanKycService.js   # KYC status fetch, NIN verify, address, bank resolve
```

---

## KYC Onboarding (3 Steps)

All 3 steps must be completed before an artisan can **accept** any job. An artisan can be **assigned** a job once NIN is verified.

| Step | What happens |
|---|---|
| **Step 1 — NIN** | Artisan enters NIN → verified immediately via QoreID `/nin-premium/{nin}` |
| **Step 2 — Business Address** | Artisan enters work address → saved immediately; physical verification is async (see below) |
| **Step 3 — Bank Details** | Artisan enters account number + bank → resolved via Paystack account lookup |

The dashboard shows a 3-step progress tracker. The Jobs page shows a banner listing exactly which steps are still missing.

---

## Physical Address Verification (Async)

When an artisan accepts a job for the first time, the server automatically submits the saved address to QoreID for physical verification. A QoreID agent visits the address in person — this is **not instant**.

The result arrives asynchronously via the QoreID webhook on the server (`POST /api/v1/webhooks/qoreid`). The artisan's `addressStatus` is then updated to `VERIFIED` or `NOT_VERIFIED` (agent visited but couldn't confirm the address) by the server, and the artisan receives an in-app notification. A separate `FAILED` status covers the case where the server couldn't even submit the check to QoreID (technical/network issue), set earlier when the job is first accepted.

This verification **never blocks** job acceptance — the artisan can work normally while it is pending.

---

## Job Pipeline

### Sample Job
```
Assigned → In Progress → Admin Review → Sample Approved → Completed
```

### Production Job
```
Assigned → In Progress → Admin Review → Pending Delivery → Dispatched → Delivered
```

- **Admin Review** step is shown in amber with a pulsing clock. Future steps are grayed out while admin reviews.
- When a video is rejected by admin, the artisan sees the rejection feedback and can re-upload.

---

## Video Upload

- Accepted formats: any video file (`video/*`)
- Max size: **100 MB** (enforced on both click-to-select and drag-and-drop)
- Error message appears below the drop zone and auto-dismisses after 4 seconds
- After upload, status advances to `VIDEO_UPLOADED`

---

## Earnings

Stage earnings are calculated using the rates snapshotted at order creation (`snapshotStage1Rate`, `snapshotStage2Rate` on the order). This ensures earnings shown always match what admin actually releases, regardless of any commission setting changes made after the order was placed.

| Card | What it shows |
|---|---|
| Total Earned | Sum of all RELEASED payments |
| Sample Earnings | Released SAMPLE_FLAT_FEE payments |
| Production Earnings | Released MATERIAL + SERVICE payments |

Payment receipts are downloadable as PDF. Filename format: `leddar-ORD-XXXXXX.pdf`.

---

## Testing

### Test Structure

```
src/
└── __tests__/
    └── utils/
        └── displayRef.test.js   # displayRef() utility — formats order/job/payment refs
                                 #   for display (returns "—" for null/undefined, passes
                                 #   through valid refs like "ORD-ABC123" unchanged)
```

### Running Tests

```bash
# Run all tests
npm test

# Run a specific test file
npx jest src/__tests__/utils/displayRef.test.js

# Run tests matching a name pattern
npx jest --testNamePattern="displayRef"

# Watch mode (re-runs on file change)
npx jest --watch
```

Tests run with **babel-jest**. No API mocking required for utility tests.

---

## Pages Reference

| View | Description |
|---|---|
| Dashboard | Stats, KYC tracker, active job summary |
| My Jobs | All jobs grouped by order with filter tabs |
| Job Details | Full job view: specs, pipeline, video upload, earnings |
| Identity Verification | 3-step KYC flow |
| My Earnings | Earnings breakdown + payment history + receipt download |
| Bank Details | Add / update bank account |
| My Profile | Update personal info |
