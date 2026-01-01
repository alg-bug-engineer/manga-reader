import requests
import json
import os
import base64
import time

# 配置
BASE_URL = "http://127.0.0.1:3001"
OUTPUT_DIR = "comic_output"  # 所有结果保存到这个文件夹
CONCEPT = "Transformer模型 (注意力机制)"  # 测试的主题

def setup_directories():
    """创建输出目录"""
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"📁 已创建输出目录: {OUTPUT_DIR}")
    else:
        print(f"📁 输出目录已存在: {OUTPUT_DIR}")

def save_script_to_txt(panels, filename="script.txt"):
    """将脚本 JSON 保存为易读的 TXT 文件"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(f"主题: {CONCEPT}\n")
            f.write("=" * 50 + "\n\n")
            
            for panel in panels:
                p_num = panel.get('panelNumber', '?')
                scene = panel.get('sceneDescription', '无描述')
                dialogue = panel.get('dialogue', '无对白')
                
                f.write(f"【第 {p_num} 格】\n")
                f.write(f"🖼️ 画面: {scene}\n")
                f.write(f"🗣️ 对白: {dialogue}\n")
                f.write("-" * 30 + "\n")
                
        print(f"✅ 脚本已保存至: {filepath}")
        return True
    except Exception as e:
        print(f"❌ 保存脚本失败: {e}")
        return False

def generate_and_save_image(panel):
    """请求生成图片并保存"""
    url = f"{BASE_URL}/api/generate-image"
    panel_num = panel.get('panelNumber')
    
    payload = {
        "panel": panel,
        "style": "cat",  # 可以修改为 'peach' 或 'doraemon'
        "model": "gemini-3-pro-image-preview"
    }

    print(f"🎨 正在生成第 {panel_num} 格图片...", end="", flush=True)
    
    try:
        start = time.time()
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                # 获取 Base64 数据
                img_b64 = data.get("imageData")
                img_data = base64.b64decode(img_b64)
                
                # 保存图片
                img_filename = f"{panel_num}.png"
                img_path = os.path.join(OUTPUT_DIR, img_filename)
                
                with open(img_path, 'wb') as f:
                    f.write(img_data)
                
                print(f" ✅ 保存成功 ({time.time()-start:.2f}s) -> {img_path}")
                return True
            else:
                print(f" ❌ API 错误: {data.get('error')}")
        else:
            print(f" ❌ HTTP 错误: {response.status_code}")
            
    except Exception as e:
        print(f" ❌ 请求异常: {e}")
    
    return False

def main():
    print(f"🚀 开始测试完整工作流: {CONCEPT}")
    setup_directories()

    # 1. 生成脚本
    print("\n📝 [步骤 1] 正在生成漫画脚本...")
    script_url = f"{BASE_URL}/api/generate-script"
    
    try:
        resp = requests.post(script_url, json={"concept": CONCEPT})
        if resp.status_code != 200:
            print(f"❌ 脚本生成失败，终止流程。HTTP {resp.status_code}")
            print(resp.text)
            return

        script_data = resp.json()
        if not script_data.get("success"):
            print(f"❌ 脚本生成失败: {script_data.get('error')}")
            return

        panels = script_data.get("panels", [])
        print(f"✅ 脚本生成完毕，共 {len(panels)} 格")

        # 2. 保存脚本到 TXT
        save_script_to_txt(panels)

        # 3. 遍历脚本生成图片
        print(f"\n🎨 [步骤 2] 开始根据脚本生成图片 (共 {len(panels)} 张)...")
        
        success_count = 0
        for panel in panels:
            if generate_and_save_image(panel):
                success_count += 1
            # 加上一点延时，防止请求过快（可选）
            break
            time.sleep(0.5)

        print(f"\n{'='*50}")
        print(f"🎉 流程结束！")
        print(f"📊 脚本: 已保存")
        print(f"🖼️ 图片: 成功 {success_count}/{len(panels)}")
        print(f"📂 请查看文件夹: {os.path.abspath(OUTPUT_DIR)}")
        print(f"{'='*50}")

    except Exception as e:
        print(f"❌ 发生致命错误: {e}")

if __name__ == "__main__":
    main()