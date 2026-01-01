'use client';

import { ComicPanel } from '@/types/manga-generation';

interface ComicGridProps {
  panels: ComicPanel[];
  onRegenerate?: (panelNumber: number) => void;
  isRegenerating?: boolean;
  regeneratingPanel?: number;
}

export default function ComicGrid({ panels, onRegenerate, isRegenerating, regeneratingPanel }: ComicGridProps) {
  // 将panels分组，每组4个
  const groups = [];
  for (let i = 0; i < panels.length; i += 4) {
    groups.push(panels.slice(i, i + 4));
  }

  return (
    <div className="space-y-8">
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <div className="grid grid-cols-2 gap-4">
            {group.map((panel) => {
              const isCurrentlyRegenerating = regeneratingPanel === panel.panelNumber;

              return (
                <div
                  key={panel.panelNumber}
                  className="relative group aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden border-2 border-zinc-200 dark:border-zinc-700"
                >
                  {panel.generatedImage ? (
                    <>
                      {/* 生成的图片 */}
                      <img
                        src={`data:image/png;base64,${panel.generatedImage}`}
                        alt={`Panel ${panel.panelNumber}`}
                        className="w-full h-full object-cover"
                      />

                      {/* 悬停覆盖层 */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <button
                          onClick={() => !isCurrentlyRegenerating && onRegenerate?.(panel.panelNumber)}
                          disabled={isCurrentlyRegenerating}
                          className="px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex items-center gap-2"
                        >
                          {isCurrentlyRegenerating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
                              <span>重新生成中...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>重新生成</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* 格数标记 */}
                      <div className="absolute top-2 left-2 w-8 h-8 bg-emerald-500 dark:bg-emerald-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{panel.panelNumber}</span>
                      </div>
                    </>
                  ) : panel.generationError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                      <div className="text-4xl mb-2">⚠️</div>
                      <p className="text-sm text-red-600 dark:text-red-400 mb-2">生成失败</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{panel.generationError}</p>
                      <button
                        onClick={() => onRegenerate?.(panel.panelNumber)}
                        className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        重试
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
