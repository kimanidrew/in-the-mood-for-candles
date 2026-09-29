import "./globals.css";

export const metadata = {
  title: "In The Mood Candles | Hand-poured candles",
  description: "Hand-poured candles made to set the mood.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
