import os
from pathlib import Path
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm  # 如果不想装 tqdm，可以删除相关代码

def process_image(file_path, quality=80):
    """
    将单个 PNG 转换为 JPG 并删除原图
    :param file_path: pathlib.Path 对象
    :param quality: JPG 压缩质量 (1-100)，80 是体积与画质的平衡点
    """
    try:
        # 构造新的 jpg 文件路径
        jpg_path = file_path.with_suffix('.jpg')
        
        with Image.open(file_path) as img:
            # 1. 处理颜色模式
            # PNG 可能是 RGBA (带透明度) 或 P 模式，JPG 不支持透明度
            # 直接转 RGB 会让透明背景变黑。如果想要白色背景，需创建一个白色底图。
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                # 创建一个白色背景图像
                background = Image.new('RGB', img.size, (255, 255, 255))
                # 将原图粘贴到背景上，使用原图作为掩码（处理透明度）
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            else:
                img = img.convert('RGB')
            
            # 2. 保存为 JPG
            # optimize=True 会进行额外的压缩优化
            img.save(jpg_path, 'JPEG', quality=quality, optimize=True)

        # 3. 验证并删除原图 (安全起见，确认新文件存在再删)
        if jpg_path.exists():
            os.remove(file_path)
            return True, f"Converted: {file_path.name}"
            
    except Exception as e:
        return False, f"Error {file_path.name}: {e}"

def batch_convert(directory, max_workers=8):
    # 设置目标文件夹路径
    root_dir = Path(directory)
    
    # 递归查找所有 png 文件
    png_files = list(root_dir.rglob('*.png'))
    
    if not png_files:
        print("未找到 PNG 文件。")
        return

    print(f"找到 {len(png_files)} 个 PNG 文件，准备开始转换...")
    
    # 使用线程池并发处理
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # 使用 tqdm 显示进度条
        results = list(tqdm(executor.map(process_image, png_files), total=len(png_files), unit="img"))

    # 简单的结果统计
    success_count = sum(1 for success, _ in results if success)
    print(f"\n处理完成: 成功 {success_count} / 总数 {len(png_files)}")

if __name__ == '__main__':
    # --- 配置区域 ---
    TARGET_DIR = r"/Users/zql_minii/ai-project/manga-reader/data/Token到底是个啥"  # 修改为你的图片文件夹路径
    # ----------------
    
    # ⚠️ 警告：此操作会删除原文件，建议首次运行先备份少量数据测试
    batch_convert(TARGET_DIR)