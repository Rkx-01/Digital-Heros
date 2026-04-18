import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-heading" 
});

export const metadata: Metadata = {
  title: "GolfDraw | Tracker, Rewards, Charity",
  description: "Track your golf scores, enter monthly draws for big prizes, and support your favorite charities. A modern platform for the modern golfer.",
  keywords: ["golf", "score tracker", "lottery", "charity", "prize draw", "golf rewards"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-surface-900 font-sans text-foreground antialiased",
          inter.variable,
          spaceGrotesk.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          {/* Background decorative elements */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-brand-500/10 blur-[120px]" />
            <div className="absolute top-[20%] -right-[5%] h-[35%] w-[35%] rounded-full bg-accent-500/10 blur-[100px]" />
            <div className="absolute bottom-[10%] left-[20%] h-[30%] w-[30%] rounded-full bg-success-500/5 blur-[120px]" />
          </div>
          
          <main className="relative z-10 flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
