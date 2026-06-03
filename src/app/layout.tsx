import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Caveat Vault — Triple-Lock Security Console",
  description:
    "Classified-document dark console for the Caveat Triple-Lock Vault System.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
