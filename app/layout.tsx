import localFont from "next/font/local";
import "./globals.css";

const formula = localFont({
  src: "../public/fonts/Formula1.ttf",
  variable: "--font-formula",
});

const luckies = localFont({
  src: "../public/fonts/Luckies.ttf",
  variable: "--font-luckies",
});

const sixcap = localFont({
  src: "../public/fonts/Sixcap.ttf",
  variable: "--font-sixcap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${formula.variable} ${luckies.variable} ${sixcap.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}