'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StyleSelector from '@/components/manga-generation/StyleSelector';
import ScriptViewer from '@/components/manga-generation/ScriptViewer';
import ComicGrid from '@/components/manga-generation/ComicGrid';
import PublishForm from '@/components/manga-generation/PublishForm';
import { ComicPanel, MangaStyle, GenerationProgress } from '@/types/manga-generation';
import { useToast } from '@/lib/contexts/ToastContext';

type Step = 'input' | 'script' | 'generating' | 'review' | 'publish' | 'publishing' | 'completed';

export default function GenerateComicPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [concept, setConcept] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<MangaStyle>('peach');
  const [scriptPanels, setScriptPanels] = useState<ComicPanel[]>([]);
  const [comicPanels, setComicPanels] = useState<ComicPanel[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    stage: 'input',
    message: ''
  });
  const [regeneratingPanel, setRegeneratingPanel] = useState<number | undefined>();
  const [proxyServerReady, setProxyServerReady] = useState<boolean | null>(null);

  // 检查 Python 代理服务器状态
  useEffect(() => {
    const checkProxyServer = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3001/health', {
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          const data = await response.json();
          const ready = data.status === 'ok' && data.client_initialized && data.has_api_key;
          setProxyServerReady(ready);

          if (!ready) {
            console.warn('[Proxy] Python 代理服务器未就绪:', data);
            showToast('warning', 'Python 代理服务器未完全就绪，可能需要配置 API Key');
          }
        } else {
          setProxyServerReady(false);
        }
      } catch (error) {
        setProxyServerReady(false);
        console.warn('[Proxy] 无法连接到 Python 代理服务器');
        showToast('warning', 'Python 代理服务器未启动。请运行: ./start-proxy-server.sh');
      }
    };

    checkProxyServer();
  }, [showToast]);

  // 步骤1: 生成脚本
  const handleGenerateScript = async () => {
    if (!concept.trim()) {
      showToast('error', '请输入AI概念');
      return;
    }

    // 检查代理服务器状态
    if (proxyServerReady === false) {
      showToast('error', '请先启动 Python 代理服务器：./start-proxy-server.sh');
      return;
    }

    setIsGenerating(true);
    setCurrentStep('script');
    setGenerationProgress({
      stage: 'generating-script',
      message: '正在生成漫画脚本...'
    });

    try {
      const response = await fetch('/api/generate-comic/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, style: selectedStyle })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '生成脚本失败');
      }

      setScriptPanels(data.panels);
      showToast('success', `成功生成 ${data.panels.length} 格漫画脚本！`);

      // 自动进入生成图片阶段
      setTimeout(() => {
        handleGenerateImages(data.panels);
      }, 2000);
    } catch (error) {
      console.error('Error generating script:', error);
      showToast('error', error instanceof Error ? error.message : '生成脚本失败');
      setCurrentStep('input');
      setIsGenerating(false);
    }
  };

  // 步骤2: 生成图片
  const handleGenerateImages = async (panels: ComicPanel[]) => {
    setCurrentStep('generating');
    setGenerationProgress({
      stage: 'generating-images',
      currentPanel: 0,
      totalPanels: panels.length,
      message: '正在生成漫画图片...'
    });

    const updatedPanels = [...panels];

    for (let i = 0; i < updatedPanels.length; i++) {
      setGenerationProgress({
        stage: 'generating-images',
        currentPanel: i + 1,
        totalPanels: updatedPanels.length,
        message: `正在生成第 ${i + 1}/${updatedPanels.length} 张图片...`
      });

      try {
        // 调用实际的图片生成API
        const response = await fetch('/api/generate-comic/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            panel: updatedPanels[i],
            style: selectedStyle,
            referenceImageData: i > 0 ? updatedPanels[i - 1].generatedImage : undefined
          })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || '生成图片失败');
        }

        // 更新生成的图片
        updatedPanels[i].generatedImage = data.imageData;
        updatedPanels[i].generationError = undefined;
      } catch (error) {
        console.error(`Error generating panel ${i + 1}:`, error);
        updatedPanels[i].generationError = error instanceof Error ? error.message : '生成失败';

        // 如果是单个图片失败，继续生成其他图片
        continue;
      }

      setComicPanels([...updatedPanels]);

      // 添加速率限制延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setIsGenerating(false);
    setCurrentStep('review');

    // 检查是否有生成失败的图片
    const failedCount = updatedPanels.filter(p => p.generationError).length;
    if (failedCount > 0) {
      showToast('warning', `${failedCount} 张图片生成失败，您可以重新生成`);
    } else {
      showToast('success', '所有图片生成完成！');
    }
  };

  // 重新生成单张图片
  const handleRegeneratePanel = async (panelNumber: number) => {
    setRegeneratingPanel(panelNumber);

    try {
      const panel = comicPanels.find(p => p.panelNumber === panelNumber);
      if (!panel) return;

      const response = await fetch('/api/generate-comic/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panel, style: selectedStyle })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '重新生成失败');
      }

      // 更新面板数据
      setComicPanels(prev => prev.map(p =>
        p.panelNumber === panelNumber
          ? { ...p, generatedImage: data.imageData, generationError: undefined }
          : p
      ));

      showToast('success', `第 ${panelNumber} 格图片重新生成成功！`);
    } catch (error) {
      console.error('Error regenerating panel:', error);
      showToast('error', error instanceof Error ? error.message : '重新生成失败');

      // 标记错误
      setComicPanels(prev => prev.map(p =>
        p.panelNumber === panelNumber
          ? { ...p, generationError: error instanceof Error ? error.message : '生成失败' }
          : p
      ));
    } finally {
      setRegeneratingPanel(undefined);
    }
  };

  // 发布漫画
  const handlePublish = async (metadata: any) => {
    setIsGenerating(true);
    setCurrentStep('publishing');

    try {
      const response = await fetch('/api/generate-comic/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metadata,
          panels: comicPanels,
          style: selectedStyle
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '发布失败');
      }

      setCurrentStep('completed');
      showToast('success', '漫画发布成功！');

      // 3秒后跳转到首页
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Error publishing comic:', error);
      showToast('error', error instanceof Error ? error.message : '发布失败');
      setCurrentStep('publish');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎨</span>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                AI漫画生成器
              </h1>
            </div>

            {/* 服务器状态指示器 */}
            <div className="flex items-center gap-2">
              {proxyServerReady === null && (
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-zinc-300 border-t-transparent" />
                  <span className="hidden md:inline">检查服务器...</span>
                </div>
              )}
              {proxyServerReady === true && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden md:inline">Python 服务就绪</span>
                </div>
              )}
              {proxyServerReady === false && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="hidden md:inline">Python 服务离线</span>
                </div>
              )}
            </div>

            {/* 步骤指示器 */}
            <div className="hidden md:flex items-center gap-2">
              {[
                { key: 'input', label: '输入' },
                { key: 'script', label: '脚本' },
                { key: 'generating', label: '生成' },
                { key: 'review', label: '审核' },
                { key: 'publish', label: '发布' }
              ].map((step, index) => {
                const isCompleted = getStepOrder(currentStep) > getStepOrder(step.key as Step);
                const isCurrent = currentStep === step.key;

                return (
                  <div key={step.key} className="flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${isCompleted ? 'bg-emerald-500 text-white' : ''}
                      ${isCurrent ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-900' : ''}
                      ${!isCompleted && !isCurrent ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400' : ''}
                    `}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {step.label}
                    </span>
                    {index < 4 && <div className="mx-2 w-8 h-0.5 bg-zinc-200 dark:bg-zinc-700" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* 步骤1: 输入概念 */}
        {currentStep === 'input' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div>
              <h2 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                想要了解哪个AI概念？
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400">
                输入一个人工智能领域的概念，我们将为你生成生动有趣的科普漫画
              </p>
            </div>

            {/* 概念输入 */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                AI概念 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="例如：RAG、LLM、Transformer、Embedding..."
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg
                         text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                         transition-colors text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleGenerateScript()}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">热门概念:</span>
                {['RAG', 'LLM', 'Token', 'Transformer', 'Embedding', 'Fine-tuning'].map((hot) => (
                  <button
                    key={hot}
                    onClick={() => setConcept(hot)}
                    className="px-2.5 py-1 text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300
                             rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-700
                             dark:hover:text-emerald-400 transition-colors"
                  >
                    {hot}
                  </button>
                ))}
              </div>
            </div>

            {/* 风格选择 */}
            <StyleSelector
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
            />

            {/* 开始生成按钮 */}
            <div className="flex justify-center">
              <button
                onClick={handleGenerateScript}
                disabled={!concept.trim() || isGenerating}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-lg
                         transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                开始生成漫画
              </button>
            </div>
          </div>
        )}

        {/* 步骤2: 显示脚本 */}
        {(currentStep === 'script' || currentStep === 'generating') && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <ScriptViewer panels={scriptPanels} isLoading={currentStep === 'script'} />

            {currentStep === 'generating' && (
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    生成进度
                  </h3>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {generationProgress.currentPanel} / {generationProgress.totalPanels}
                  </span>
                </div>

                {/* 进度条 */}
                <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${((generationProgress.currentPanel || 0) / (generationProgress.totalPanels || 1)) * 100}%`
                    }}
                  />
                </div>

                <p className="mt-3 text-center text-sm text-zinc-600 dark:text-zinc-400">
                  {generationProgress.message}
                </p>

                {/* 生成的图片预览 */}
                {comicPanels.length > 0 && (
                  <div className="mt-6">
                    <ComicGrid
                      panels={comicPanels}
                      isRegenerating={false}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 步骤3: 审核和编辑 */}
        {currentStep === 'review' && (
          <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  审核漫画
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  检查生成的漫画，可以重新生成不满意的图片
                </p>
              </div>

              <button
                onClick={() => setCurrentStep('publish')}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium
                         transition-colors flex items-center gap-2"
              >
                <span>确认无误，去发布</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <ComicGrid
              panels={comicPanels}
              onRegenerate={handleRegeneratePanel}
              isRegenerating={!!regeneratingPanel}
              regeneratingPanel={regeneratingPanel}
            />
          </div>
        )}

        {/* 步骤4: 发布 */}
        {currentStep === 'publish' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                发布漫画
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                填写漫画信息，发布到平台让更多人看到
              </p>
            </div>

            <PublishForm onSubmit={handlePublish} isLoading={isGenerating} />
          </div>
        )}

        {/* 步骤5: 完成 */}
        {currentStep === 'completed' && (
          <div className="max-w-2xl mx-auto text-center py-16 animate-fade-in">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              漫画发布成功！
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
              正在跳转到首页...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mx-auto" />
          </div>
        )}
      </main>
    </div>
  );
}

// 辅助函数：获取步骤顺序
function getStepOrder(step: Step): number {
  const order: Record<Step, number> = {
    'input': 0,
    'script': 1,
    'generating': 2,
    'review': 3,
    'publish': 4,
    'publishing': 5,
    'completed': 6
  };
  return order[step];
}
