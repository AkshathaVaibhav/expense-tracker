import "./globals.css";

export const metadata = {
  title: "Kubera - Expense Tracker",
  description: "Manage your income, expenses and monthly budget with Kubera.",
  manifest: "/manifest.json",
  themeColor: "#073B2E",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}