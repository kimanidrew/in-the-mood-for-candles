import "./globals.css";

export const metadata = {
  title: "In The Mood Candles | Hand-poured candles",
  description: "Hand-poured candles made to set the mood.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
