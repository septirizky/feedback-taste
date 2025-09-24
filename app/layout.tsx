import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Taste Experience",
  description: "Restaurant sauce feedback kiosk",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
