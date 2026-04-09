"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { User, Job, Payment, Notification } from "../types";
import {
  mockUser,
  mockJobs,
  mockPayments,
  mockNotifications,
} from "../data/mockData";

interface AppContextType {
  isAuthenticated: boolean;
  user: User | null;
  jobs: Job[];
  payments: Payment[];
  notifications: Notification[];
  login: (email: string, password: string) => boolean;
  signup: (userData: Partial<User>, password: string) => boolean;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateJobStatus: (jobId: string, status: Job["status"]) => void;
  markNotificationAsRead: (notificationId: string) => void;
  updateKYC: (kycData: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [payments] = useState<Payment[]>(mockPayments);
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  const login = (email: string, password: string) => {
    if (email && password) {
      setUser(mockUser);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const signup = (userData: Partial<User>, password: string) => {
    if (userData.email && password) {
      const newUser: User = {
        id: Math.random().toString(),
        fullName: userData.fullName || "",
        email: userData.email,
        phone: userData.phone || "",
        whatsapp: userData.whatsapp || "",
        specialty: userData.specialty || "",
        kycStatus: "pending",
      };
      setUser(newUser);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const updateJobStatus = (jobId: string, status: Job["status"]) => {
    setJobs(jobs.map((job) => (job.id === jobId ? { ...job, status } : job)));
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      ),
    );
  };

  const updateKYC = (kycData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...kycData });
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        user,
        jobs,
        payments,
        notifications,
        login,
        signup,
        logout,
        updateUser,
        updateJobStatus,
        markNotificationAsRead,
        updateKYC,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
