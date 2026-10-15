import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Lecture Planner & Syllabus Scheduler",
  description: "AI-powered university syllabus scheduler that extracts topics, balances hours, maps lecture calendar dates, and supports multi-format exports.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <ClerkProvider>
        <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">{children}</body>
      </ClerkProvider>
    </html>
  );
}
