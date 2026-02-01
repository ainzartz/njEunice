import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NJ Eunice - RE/MAX NOW",
  description: "Advanced Real Estate Platform for New Jersey",
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
