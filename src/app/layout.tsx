import type { Metadata } from "next";
import type * as React from "react";
import { Toaster } from "sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "Overture",
  description:
    "A Next.js App Router music app starter with Supabase, Prisma, playlists, and low-latency playback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: "rgba(9, 16, 27, 0.94)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#f4efe6",
            },
          }}
        />
      </body>
    </html>
  );
}
