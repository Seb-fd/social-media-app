import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Social Media App",
  description: "Social media application built with Next.js",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "shortcut icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/favicon.ico" },
  ],
};

const clerkAppearance = {
  variables: {
    colorPrimary: "0 0% 9%",
    colorTextOnPrimaryBackground: "0 0% 98%",
    colorBackground: "0 0% 100%",
    colorInputBackground: "transparent",
    colorInputText: "0 0% 9%",
    colorText: "0 0% 9%",
    colorTextOnButtonBackground: "0 0% 98%",
    colorTextSecondary: "0 0% 45%",
    colorTextPlaceholder: "0 0% 55%",
    colorBorder: "0 0% 83%",
    colorBorderOnHover: "0 0% 45%",
    borderRadius: "0.5rem",
    fontSmoothing: "antialiased",
  },
  elements: {
    formButtonPrimary: 
      "bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 h-10 px-4 py-2 rounded-md font-medium transition-colors",
    card: "bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-sm rounded-lg p-4",
    headerTitle: "text-black dark:text-white font-semibold text-xl",
    headerSubtitle: "text-neutral-500 dark:text-neutral-400 text-sm",
    socialButtonsBlockButton: 
      "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 h-11 text-neutral-700 dark:text-neutral-200 font-medium transition-colors rounded-md",
    socialButtonsBlockButtonText: "text-neutral-700 dark:text-neutral-200 font-medium text-sm",
    formFieldInput: 
      "border border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-900 text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black dark:focus:ring-white h-10 px-3 rounded-md transition-colors",
    formFieldLabel: "text-neutral-700 dark:text-neutral-300 font-medium text-sm mb-1 block",
    formFieldError: "text-red-500 text-xs mt-1",
    footerActionLink: "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white font-medium text-sm",
    dividerLine: "bg-neutral-200 dark:bg-neutral-700",
    dividerText: "text-neutral-400 dark:text-neutral-500 text-xs uppercase tracking-widest",
    identityPreviewEditButton: 
      "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white text-sm font-medium",
    identityPreviewText: "text-black dark:text-white",
    backButton: "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white font-medium text-sm",
    formFieldInputShowPasswordButton: "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white",
    otpCodeFieldInput: "border border-neutral-400 dark:border-neutral-500 rounded-md text-center bg-white dark:bg-neutral-900 text-black dark:text-white",
    badge: "bg-black dark:bg-white text-white dark:text-black",
    formFieldRow: "flex flex-col gap-1",
    form: "flex flex-col gap-4",
    modalBackdrop: "bg-black/60 backdrop-blur-sm",
    modalContent: "bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 shadow-xl rounded-xl",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen">
              <Navbar />
              <main className="py-8">
                {/*container to center the content*/}
                <div className="max-w-7xl mx-auto px-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="hidden lg:block lg:col-span-3">
                      <Sidebar />
                    </div>
                    <div className="lg:col-span-9">{children}</div>
                  </div>
                </div>
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
