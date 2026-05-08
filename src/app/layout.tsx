/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../index.css";
import Providers from "../components/providers/Providers";

export const metadata: Metadata = {
  title: "Leddar Artisan App",
  description: "Artisan workflow dashboard and marketplace registration",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* All client-side state (Redux, etc.) lives here */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
