import type { Metadata } from "next";
import { Manrope, Outfit, JetBrains_Mono, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import "./image-protection.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ToastProvider } from "@/lib/contexts/ToastContext";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "芝士AI吃鱼 - AI知识科普漫画",
  description: "通过生动有趣的漫画形式，轻松掌握人工智能、机器学习、深度学习等前沿技术知识",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${manrope.variable} ${outfit.variable} ${jetbrainsMono.variable} ${notoSansSC.variable}`}>
      <body className="antialiased">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
