'use client';

import { ComicPanel } from '@/types/manga-generation';

interface ScriptViewerProps {
  panels: ComicPanel[];
  isLoading?: boolean;
}

export default function ScriptViewer({ panels, isLoading }: ScriptViewerProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mb-4"></div>
            <p className="text-zinc-600 dark:text-zinc-400">正在生成漫画脚本...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          漫画脚本预览
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          共 {panels.length} 格漫画
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
        {panels.map((panel) => (
          <div
            key={panel.panelNumber}
            className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700"
          >
            <div className="flex items-start gap-4">
              {/* 格数标签 */}
              <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 dark:bg-emerald-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">{panel.panelNumber}</span>
              </div>

              {/* 内容 */}
              <div className="flex-1 space-y-2">
                {/* 场景描述 */}
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                    画面描述
                  </h4>
                  <p className="text-sm text-zinc-900 dark:text-zinc-100">
                    {panel.sceneDescription}
                  </p>
                </div>

                {/* 台词 */}
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                    台词/旁白
                  </h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 italic">
                    {panel.dialogue}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
