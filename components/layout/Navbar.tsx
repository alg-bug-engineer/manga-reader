'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useState } from 'react';
import AuthModal from '../feedback/AuthModal';
import ThemeToggle from '../ui/ThemeToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-700">
        <div className="container mx-auto px-6 py-3.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold
                         text-zinc-900 dark:text-zinc-100
                         hover:opacity-80 transition-opacity font-display"
            >
              <span className="text-xl">🧀</span>
              <span>芝士AI吃鱼</span>
            </Link>

            {/* 桌面端菜单 */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition font-medium">
                首页
              </Link>
              {/* 生成漫画功能已暂时隐藏
              <Link
                href="/generate-comic"
                className="text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>生成漫画</span>
              </Link>
              */}
              <Link
                href="/#latest"
                className="text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition font-medium"
              >
                最新
              </Link>
              <Link
                href="/#popular"
                className="text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition font-medium"
              >
                人气
              </Link>

              <div className="flex items-center gap-3 ml-4">
                {/* 主题切换 */}
                <ThemeToggle />

                {/* 用户信息 */}
                {user ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/user/${user.id}`}
                      className="text-sm text-right hover:opacity-80 transition-opacity"
                    >
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{user.username}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
                    </Link>
                    <button
                      onClick={logout}
                      className="px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition font-medium"
                    >
                      登出
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-md font-medium hover:shadow-md transition-all"
                  >
                    登录 / 注册
                  </button>
                )}
              </div>
            </div>

            {/* 移动端菜单按钮 */}
            <button
              className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                // 关闭图标
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // 汉堡菜单图标
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 移动端菜单面板 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 animate-slide-in">
            <div className="container mx-auto px-6 py-4 space-y-4">
              {/* 导航链接 */}
              <div className="space-y-3">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-zinc-900 dark:text-zinc-100 font-medium text-lg border-b border-zinc-100 dark:border-zinc-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  🏠 首页
                </Link>
                {/* 生成漫画功能已暂时隐藏
                <Link
                  href="/generate-comic"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-zinc-900 dark:text-zinc-100 font-medium text-lg border-b border-zinc-100 dark:border-zinc-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  ⚡ 生成漫画
                </Link>
                */}
                <Link
                  href="/#latest"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-zinc-700 dark:text-zinc-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  📖 最新更新
                </Link>
                <Link
                  href="/#popular"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-zinc-700 dark:text-zinc-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  ⭐ 人气推荐
                </Link>
              </div>

              {/* 用户区域 */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                {user ? (
                  <div className="space-y-3">
                    {/* 用户信息 */}
                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 text-lg mb-1">
                        {user.username}
                      </div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</div>
                    </div>

                    {/* 用户中心链接 */}
                    <Link
                      href={`/user/${user.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-3 text-zinc-700 dark:text-zinc-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                    >
                      <span>👤 个人中心</span>
                      <span>→</span>
                    </Link>

                    {/* 登出按钮 */}
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      登出
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowAuthModal(true);
                    }}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium text-lg hover:shadow-lg transition-all"
                  >
                    登录 / 注册
                  </button>
                )}
              </div>

              {/* 关闭提示 */}
              <div className="pt-4 text-center text-sm text-zinc-400 dark:text-zinc-500">
                点击外部或向上滑动关闭菜单
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* 点击外部关闭 */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="login"
      />
    </>
  );
}
