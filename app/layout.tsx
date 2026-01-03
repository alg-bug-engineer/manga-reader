import type { Metadata } from "next";
import "./globals.css";
import "./image-protection.css";
import "./fonts.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ToastProvider } from "@/lib/contexts/ToastContext";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";

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
    <html lang="zh-CN">
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
