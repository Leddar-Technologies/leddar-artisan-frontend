/* eslint-disable react-refresh/only-export-components */
import "../index.css";
import Head from "next/head";
import Providers from "../components/providers/Providers";

export const metadata = {
  title: "Leddar Artisan Platform",
  description: "Artisan workflow dashboard and marketplace registration",

  icons: {
    icon: "/favicon.jpeg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* All client-side state (Redux, etc.) lives here */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
