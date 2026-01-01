'use client';

import React from 'react';

// 简单的 className 合并函数
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * 旋转加载动画组件
 *
 * @example
 * // 基础用法
 * <Spinner />
 *
 * // 不同尺寸
 * <Spinner size="sm" />
 * <Spinner size="md" />
 * <Spinner size="lg" />
 *
 * // 不同颜色
 * <Spinner color="primary" />
 * <Spinner color="white" />
 */

export interface SpinnerProps {
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 颜色 */
  color?: 'primary' | 'white' | 'gray' | 'current';
  /** 自定义类名 */
  className?: string;
}

const spinnerSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const spinnerColors = {
  primary: 'text-emerald-600',
  white: 'text-white',
  gray: 'text-gray-400',
  current: 'text-current',
};

export default function Spinner({
  size = 'md',
  color = 'primary',
  className,
}: SpinnerProps) {
  return (
    <svg
      className={cn(
        'animate-spin',
        spinnerSizes[size],
        spinnerColors[color],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * 页面级加载器组件
 */
export function FullPageSpinner({
  size = 'xl',
  message = '加载中...',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-900">
      <div className="text-center">
        <Spinner size={size} className="mx-auto mb-4" />
        <p className="text-zinc-600 dark:text-zinc-400">{message}</p>
      </div>
    </div>
  );
}

/**
 * 内联加载器组件
 */
export function InlineSpinner({
  size = 'sm',
  message,
}: {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Spinner size={size} />
      {message && (
        <span className="text-sm text-zinc-600 dark:text-zinc-400">{message}</span>
      )}
    </div>
  );
}
