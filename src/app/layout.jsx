/* eslint-disable react-refresh/only-export-components */
import "../index.css";
import Providers from "../components/providers/Providers";

export const metadat = {
  title: "Leddar Artisan App",
  description: "Artisan workflow dashboard and marketplace registration",
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
