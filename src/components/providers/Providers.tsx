"use client";

import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "../../redux/store"; // Ensure this path matches your store location

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: { children: ProvidersProps }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}
