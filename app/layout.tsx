import localFont from "next/font/local";
import "./globals.css";

const formula = localFont({
  src: "../public/fonts/Formula1.ttf",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={formula.className}>{children}</body>
    </html>
  );
}