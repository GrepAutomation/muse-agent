import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MUSE — AI Creative Director",
  description: "AI-powered creative production pipeline. Powered by Gemini.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0f] text-gray-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
