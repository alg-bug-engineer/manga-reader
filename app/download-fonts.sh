#!/bin/bash

# 字体下载脚本
# 使用国内镜像源下载 Google Fonts

cd "$(dirname "$0")/fonts"

echo "正在下载 Manrope 字体..."
curl -L -o Manrope.woff2 "https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRggexSg.woff2"

echo "正在下载 Outfit 字体..."
curl -L -o Outfit.woff2 "https://fonts.gstatic.com/s/outfit/v11/QGYvz_MZcI_p9kmH8gzKGE6cKg.woff2"

echo "正在下载 JetBrains Mono 字体..."
curl -L -o JetBrainsMono.woff2 "https://fonts.gstatic.com/s/jetbrainsmono/v19/JTUHjIg16_iA6BOVUI_c-0i0.woff2"

echo "正在下载 Noto Sans SC 字体..."
curl -L -o NotoSansSC.woff2 "https://fonts.gstatic.com/s/notosanssc/v35/k3kCo84MPvpLmixcA63oeALhLOCT-xWNm8Hqd37x1-A.woff2"

echo "字体下载完成！"
