import { User, Job, Payment, Notification } from '../types';

export const mockUser: User = {
  id: '1',
  fullName: 'John Adebayo',
  email: 'john.adebayo@example.com',
  phone: '+234 801 234 5678',
  whatsapp: '+234 801 234 5678',
  specialty: 'Footwear',
  kycStatus: 'verified',
  location: 'Lagos, Nigeria',
  bankAccount: {
    accountName: 'John Adebayo',
    accountNumber: '0123456789',
    bankName: 'First Bank',
  },
};

export const mockJobs: Job[] = [
  {
    id: '1',
    productType: 'Leather Boots',
    quantity: 50,
    deadline: '2026-04-15',
    status: 'in_progress',
    specifications: 'Brown leather boots with rubber sole. Size range: 40-45. High-quality leather required.',
    assignedDate: '2026-03-15',
  },
  {
    id: '2',
    productType: 'Leather Sandals',
    quantity: 100,
    deadline: '2026-04-30',
    status: 'assigned',
    specifications: 'Black leather sandals with adjustable straps. Unisex design. Size range: 36-44.',
    assignedDate: '2026-03-18',
  },
  {
    id: '3',
    productType: 'Leather Bags',
    quantity: 30,
    deadline: '2026-03-25',
    status: 'completed',
    specifications: 'Brown messenger bags with multiple compartments. Dimensions: 40cm x 30cm x 10cm.',
    assignedDate: '2026-02-28',
  },
  {
    id: '4',
    productType: 'Loafers',
    quantity: 75,
    deadline: '2026-05-10',
    status: 'assigned',
    specifications: 'Classic black leather loafers. Formal style with cushioned insole. Size range: 39-45.',
    assignedDate: '2026-03-20',
  },
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    jobId: '3',
    date: '2026-03-25',
    amount: 150000,
    stage: 'service',
    status: 'received',
  },
  {
    id: '2',
    jobId: '3',
    date: '2026-03-01',
    amount: 100000,
    stage: 'raw_material',
    status: 'received',
  },
  {
    id: '3',
    jobId: '1',
    date: '2026-03-15',
    amount: 200000,
    stage: 'raw_material',
    status: 'released',
  },
  {
    id: '4',
    jobId: '2',
    date: '2026-03-18',
    amount: 300000,
    stage: 'raw_material',
    status: 'pending',
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Job Assigned',
    message: 'You have been assigned a new job: Loafers (75 units)',
    date: '2026-03-20T10:30:00',
    read: false,
    type: 'job',
  },
  {
    id: '2',
    title: 'Payment Released',
    message: 'Raw material payment of ₦200,000 has been released for Leather Boots',
    date: '2026-03-19T14:20:00',
    read: false,
    type: 'payment',
  },
  {
    id: '3',
    title: 'New Job Assigned',
    message: 'You have been assigned a new job: Leather Sandals (100 units)',
    date: '2026-03-18T09:15:00',
    read: true,
    type: 'job',
  },
  {
    id: '4',
    title: 'Job Completed',
    message: 'Your completed job (Leather Bags) has been approved',
    date: '2026-03-25T16:45:00',
    read: true,
    type: 'job',
  },
  {
    id: '5',
    title: 'Payment Received',
    message: 'Service payment of ₦150,000 has been credited to your account',
    date: '2026-03-25T17:00:00',
    read: true,
    type: 'payment',
  },
];
