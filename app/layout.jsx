import "./globals.css";

export const metadata = {
  title: "HOSSNY® — Streetwear",
  description: "Men's streetwear essentials."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
