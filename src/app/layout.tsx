import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NJNY Realty Web Platform",
  description: "Advanced Real Estate Platform for New Jersey and New York",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
