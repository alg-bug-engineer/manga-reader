'use client';

import React from 'react';

// 简单的 className 合并函数
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * 统一的按钮组件
 *
 * @example
 * // 基础用法
 * <Button>点击我</Button>
 *
 * // 不同变体
 * <Button variant="primary">主要按钮</Button>
 * <Button variant="secondary">次要按钮</Button>
 * <Button variant="danger">危险按钮</Button>
 *
 * // 不同尺寸
 * <Button size="sm">小按钮</Button>
 * <Button size="md">中按钮</Button>
 * <Button size="lg">大按钮</Button>
 *
 * // Loading 状态
 * <Button loading>加载中...</Button>
 *
 * // 完整示例
 * <Button
 *   variant="primary"
 *   size="md"
 *   loading={isLoading}
 *   disabled={false}
 *   onClick={handleClick}
 *   className="mt-4"
 * >
 *   提交
 * </Button>
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 子元素 */
  children: React.ReactNode;
}

const buttonVariants = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent',
  secondary: 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
  ghost: 'bg-transparent text-zinc-700 dark:text-zinc-300 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800',
  success: 'bg-green-600 text-white hover:bg-green-700 border-transparent',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // 基础样式
        'inline-flex items-center justify-center gap-2',
        'font-medium rounded-lg',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-95',

        // 变体样式
        buttonVariants[variant],

        // 尺寸样式
        buttonSizes[size],

        // 边框（除了primary和danger都有边框）
        variant !== 'primary' && variant !== 'danger' && variant !== 'success' && 'border-2',

        // 自定义className
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading 状态 */}
      {loading && (
        <svg
          className={cn(
            'animate-spin',
            iconSizes[size]
          )}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
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
      )}

      {/* 按钮内容 */}
      <span>{children}</span>
    </button>
  );
}
