export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  specialty: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  location?: string;
  bankAccount?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
}

export interface Job {
  id: string;
  productType: string;
  quantity: number;
  deadline: string;
  status: 'assigned' | 'in_progress' | 'completed';
  specifications: string;
  assignedDate: string;
}

export interface Payment {
  id: string;
  jobId: string;
  date: string;
  amount: number;
  stage: 'raw_material' | 'service';
  status: 'pending' | 'released' | 'received';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'job' | 'payment' | 'system';
}
