'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

type AuthTab = 'login' | 'register' | 'reset';
type ResetStep = 'request' | 'confirm';

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<AuthTab>(defaultTab);
  const [resetStep, setResetStep] = useState<ResetStep>('request');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
        onClose();
      } else if (tab === 'register') {
        await register(email, username, password);
        onClose();
      } else if (tab === 'reset') {
        if (resetStep === 'request') {
          // 请求密码重置
          const response = await fetch('/api/auth/reset-password/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();

          if (data.success) {
            setSuccess(data.message);
            setResetStep('confirm');
          } else {
            setError(data.error);
          }
        } else {
          // 确认密码重置
          const response = await fetch('/api/auth/reset-password/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: resetToken, newPassword }),
          });

          const data = await response.json();

          if (data.success) {
            setSuccess(data.message);
            setTimeout(() => {
              setTab('login');
              setResetStep('request');
              setEmail('');
              setResetToken('');
              setNewPassword('');
            }, 2000);
          } else {
            setError(data.error);
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setTab('login');
    setResetStep('request');
    setError('');
    setSuccess('');
    setEmail('');
    setResetToken('');
    setNewPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden border border-zinc-200">
        {/* Header - 终端绿风格 */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white font-display">
              {tab === 'login' ? '登录' : tab === 'register' ? '注册' : '找回密码'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Tabs - 只在登录/注册模式显示 */}
          {tab !== 'reset' && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  tab === 'login'
                    ? 'bg-white text-emerald-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                登录
              </button>
              <button
                onClick={() => setTab('register')}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  tab === 'register'
                    ? 'bg-white text-emerald-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                注册
              </button>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          {tab === 'reset' ? (
            // 密码重置表单
            <>
              {resetStep === 'request' ? (
                // 步骤1：请求重置
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      注册邮箱
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-zinc-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm text-zinc-900"
                      placeholder="请输入注册时的邮箱"
                    />
                  </div>

                  <Button
                    type="submit"
                    loading={loading}
                    variant="primary"
                    className="w-full"
                  >
                    {loading ? '' : '发送重置链接'}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      ← 返回登录
                    </button>
                  </div>
                </>
              ) : (
                // 步骤2：确认重置
                <>
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-md text-sm mb-4">
                    <div className="font-medium mb-1">💡 测试环境提示</div>
                    <div className="text-xs">重置令牌已输出到服务器控制台（开发环境）</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      重置令牌
                    </label>
                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-zinc-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition font-mono text-sm text-zinc-900"
                      placeholder="请输入重置令牌"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      新密码
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-3 py-2.5 border border-zinc-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm text-zinc-900"
                      placeholder="请输入新密码（至少6位）"
                    />
                  </div>

                  <Button
                    type="submit"
                    loading={loading}
                    variant="primary"
                    className="w-full"
                  >
                    {loading ? '' : '重置密码'}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setResetStep('request')}
                      className="text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      ← 重新发送
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            // 登录/注册表单
            <>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-zinc-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm text-zinc-900"
                  placeholder="your@email.com"
                />
              </div>

              {tab === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    用户名
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-zinc-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm text-zinc-900"
                    placeholder="请输入用户名"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  密码
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 border border-zinc-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition text-sm text-zinc-900"
                  placeholder="请输入密码（至少6位）"
                />
              </div>

              <Button
                type="submit"
                loading={loading}
                variant="primary"
                className="w-full"
              >
                {loading ? '' : tab === 'login' ? '登录' : '注册'}
              </Button>

              {tab === 'login' && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setTab('reset')}
                    className="text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    忘记密码？
                  </button>
                </div>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}
