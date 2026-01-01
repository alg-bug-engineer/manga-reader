import sharp from 'sharp';

/**
 * 为图片添加水印
 * @param imageBuffer 原始图片二进制数据
 * @param watermarkText 水印文字
 * @param options 水印配置
 */
export interface WatermarkOptions {
  text?: string;
  opacity?: number; // 0-1
  fontSize?: number;
  color?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  margin?: number;
}

/**
 * 添加文字水印
 */
export async function addWatermark(
  imageBuffer: Buffer,
  options: WatermarkOptions = {}
): Promise<Buffer> {
  const {
    text = 'Protected',
    opacity = 0.3,
    fontSize = 24,
    color = '#FFFFFF',
    position = 'bottom-right',
    margin = 20,
  } = options;

  try {
    // 获取图片元数据
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;

    // 创建文字水印 SVG
    const svgText = createWatermarkSVG(text, fontSize, color, opacity);

    // 计算 watermark 位置
    const { left, top } = calculateWatermarkPosition(
      position,
      width,
      height,
      text.length * fontSize * 0.6, // 估算宽度
      fontSize,
      margin
    );

    // 添加水印
    const watermarked = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(svgText),
          left,
          top,
        },
      ])
      .toBuffer();

    return watermarked;
  } catch (error) {
    console.error('Failed to add watermark:', error);
    // 如果失败,返回原图
    return imageBuffer;
  }
}

/**
 * 创建水印 SVG
 */
function createWatermarkSVG(text: string, fontSize: number, color: string, opacity: number): string {
  const opacityValue = Math.round(opacity * 255).toString(16).padStart(2, '0');

  return `
    <svg width="${text.length * fontSize * 0.6 + 20}" height="${fontSize + 20}">
      <text
        x="10"
        y="${fontSize}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="${color}${opacityValue}"
      >
        ${text}
      </text>
    </svg>
  `.trim();
}

/**
 * 计算水印位置
 */
function calculateWatermarkPosition(
  position: string,
  imageWidth: number,
  imageHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  margin: number
): { left: number; top: number } {
  switch (position) {
    case 'top-left':
      return { left: margin, top: margin };
    case 'top-right':
      return { left: imageWidth - watermarkWidth - margin, top: margin };
    case 'bottom-left':
      return { left: margin, top: imageHeight - watermarkHeight - margin };
    case 'bottom-right':
      return {
        left: imageWidth - watermarkWidth - margin,
        top: imageHeight - watermarkHeight - margin,
      };
    case 'center':
      return {
        left: Math.floor((imageWidth - watermarkWidth) / 2),
        top: Math.floor((imageHeight - watermarkHeight) / 2),
      };
    default:
      return {
        left: imageWidth - watermarkWidth - margin,
        top: imageHeight - watermarkHeight - margin,
      };
  }
}

/**
 * 添加平铺水印(更防盗的方式)
 */
export async function addTiledWatermark(
  imageBuffer: Buffer,
  text: string = 'Protected',
  opacity: number = 0.15
): Promise<Buffer> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;

    // 创建平铺水印 SVG
    const tileSize = 200;
    const svg = `
      <svg width="${tileSize}" height="${tileSize}">
        <defs>
          <pattern id="pattern" x="0" y="0" width="${tileSize}" height="${tileSize}" patternUnits="userSpaceOnUse">
            <text
              x="50%"
              y="50%"
              font-family="Arial, sans-serif"
              font-size="20"
              font-weight="bold"
              fill="white"
              fill-opacity="${opacity}"
              text-anchor="middle"
              dominant-baseline="middle"
              transform="rotate(-30, ${tileSize / 2}, ${tileSize / 2})"
            >
              ${text}
            </text>
          </pattern>
        </defs>
        <rect width="${tileSize}" height="${tileSize}" fill="url(#pattern)" />
      </svg>
    `.trim();

    // 使用平铺水印
    const watermarked = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(svg),
          blend: 'over',
        },
      ])
      .toBuffer();

    return watermarked;
  } catch (error) {
    console.error('Failed to add tiled watermark:', error);
    return imageBuffer;
  }
}

/**
 * 为图片添加用户标识水印
 */
export async function addUserWatermark(
  imageBuffer: Buffer,
  username: string,
  timestamp: number
): Promise<Buffer> {
  const dateStr = new Date(timestamp).toLocaleDateString('zh-CN');
  const watermarkText = `${username} | ${dateStr}`;

  return addTiledWatermark(imageBuffer, watermarkText, 0.2);
}
