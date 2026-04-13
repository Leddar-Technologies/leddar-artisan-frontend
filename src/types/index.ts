export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  productionGender?: "male" | "female" | "both";
  specialty: string;
  kycStatus: "pending" | "verified" | "rejected";
  location?: string;
  bankAccount?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
}

export type JobType = "sample" | "production";
export type JobStatus =
  | "assigned"
  | "in_progress"
  | "video_uploaded"
  | "completed"
  | "declined";

export type ReferenceImage =
  | string
  | {
      label: string;
      src?: string;
      alt?: string;
    };

export interface Job {
  id: string;
  jobType: JobType;
  productType: string;
  quantity: number;
  deadline: string;
  status: JobStatus;
  specifications: string;
  assignedDate: string;
  referenceImages?: ReferenceImage[];
}

export interface Payment {
  id: string;
  jobId: string;
  date: string;
  amount: number;
  stage: "raw_material" | "service";
  status: "pending" | "released" | "received";
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "job" | "payment" | "system";
}
