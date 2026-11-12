
import "./globals.css";

export const metadata = {
  title: "Expense Tracker",
  description: "A simple and colourful personal expense tracker.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
