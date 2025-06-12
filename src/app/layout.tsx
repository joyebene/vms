import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers"; 
import { AuthProvider } from "@/lib/AuthContext";
import TokenExpirationWarning from "@/components/TokenExpirationWarning";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Visitor Management System",
  description: "Visitor Pass Management System with QR Code",
};

async function getLanguageCookie() {
    return (await cookies().get('lang'))?.value || 'en';
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


// const lang = cookies().get('lang')?.value || 'en';
const lang = await getLanguageCookie();
console.log('Detected language from cookie:', lang);

// Load translations based on lang

  return (
    <html lang={lang}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <TokenExpirationWarning warningThresholdMinutes={5} />
        </AuthProvider>
      </body>
    </html>
  );
}
