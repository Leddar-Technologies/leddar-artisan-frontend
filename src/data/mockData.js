/**
 * Mock data for the artisan dashboard.
 * Standard JavaScript version to prevent build errors in Amplify.
 */

export const mockUser = {
  id: "1",
  fullName: "John Adebayo",
  email: "john.adebayo@example.com",
  phone: "+234 801 234 5678",
  whatsapp: "+234 801 234 5678",
  producesFor: "UNISEX",
  specialty: "Footwear",
  kycStatus: "verified",
  location: "Lagos, Nigeria",
  bankAccount: {
    accountName: "John Adebayo",
    accountNumber: "0123456789",
    bankName: "First Bank",
  },
};

export const mockJobs = [
  {
    id: "1",
    jobType: "sample",
    productType: "Leather Boots Sample",
    quantity: 1,
    deadline: "2026-04-15",
    status: "video_uploaded",
    specifications:
      "Brown leather boots sample with rubber sole. Clean finishing, durable stitching, and exact reference match required.",
    assignedDate: "2026-03-15",
    referenceImages: [
      "Boot side profile",
      "Stitch detail",
      "Leather finish reference",
    ],
  },
  {
    id: "2",
    jobType: "production",
    productType: "Leather Sandals",
    quantity: 100,
    deadline: "2026-04-30",
    status: "assigned",
    specifications:
      "Black leather sandals with adjustable straps. Unisex design. Size range: 36-44.",
    assignedDate: "2026-03-18",
    referenceImages: ["Sandal front view", "Strap placement", "Sole profile"],
  },
  {
    id: "3",
    jobType: "production",
    productType: "Leather Bags",
    quantity: 30,
    deadline: "2026-03-25",
    status: "completed",
    specifications:
      "Brown messenger bags with multiple compartments. Dimensions: 40cm x 30cm x 10cm.",
    assignedDate: "2026-02-28",
    referenceImages: ["Bag front view", "Interior layout", "Handle detail"],
  },
  {
    id: "4",
    jobType: "sample",
    productType: "Loafers Sample",
    quantity: 1,
    deadline: "2026-05-10",
    status: "assigned",
    specifications:
      "Classic black leather loafer sample. Formal style, polished finish, and cushioned insole.",
    assignedDate: "2026-03-20",
    referenceImages: ["Loafer top view", "Toe shape", "Insole reference"],
  },
];

export const mockPayments = [
  {
    id: "1",
    jobId: "3",
    date: "2026-03-25",
    amount: 150000,
    stage: "service",
    status: "received",
  },
  {
    id: "2",
    jobId: "3",
    date: "2026-03-01",
    amount: 100000,
    stage: "raw_material",
    status: "received",
  },
  {
    id: "3",
    jobId: "1",
    date: "2026-03-15",
    amount: 45000,
    stage: "service",
    status: "released",
  },
  {
    id: "4",
    jobId: "2",
    date: "2026-03-18",
    amount: 300000,
    stage: "raw_material",
    status: "pending",
  },
  {
    id: "5",
    jobId: "4",
    date: "2026-03-22",
    amount: 40000,
    stage: "service",
    status: "pending",
  },
];

export const mockNotifications = [
  {
    id: "1",
    title: "New Job Assigned",
    message: "You have been assigned a new job: Loafers (75 units)",
    date: "2026-03-20T10:30:00",
    read: false,
    type: "job",
  },
  {
    id: "2",
    title: "Payment Released",
    message:
      "Raw material payment of ₦200,000 has been released for Leather Boots",
    date: "2026-03-19T14:20:00",
    read: false,
    type: "payment",
  },
  {
    id: "3",
    title: "New Job Assigned",
    message: "You have been assigned a new job: Leather Sandals (100 units)",
    date: "2026-03-18T09:15:00",
    read: true,
    type: "job",
  },
  {
    id: "4",
    title: "Job Completed",
    message: "Your completed job (Leather Bags) has been approved",
    date: "2026-03-25T16:45:00",
    read: true,
    type: "job",
  },
  {
    id: "5",
    title: "Payment Received",
    message: "Service payment of ₦150,000 has been credited to your account",
    date: "2026-03-25T17:00:00",
    read: true,
    type: "payment",
  },
];
