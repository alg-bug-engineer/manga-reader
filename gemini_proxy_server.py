"""
Gemini API 代理服务器
使用 Python Google SDK，自动支持系统代理
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import google.genai as genai
import os
import base64
from PIL import Image
from google.genai import types
import io
from dotenv import load_dotenv
from datetime import datetime

def get_current_time():
    """获取当前时间字符串"""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# 加载环境变量
# 尝试加载多个可能的环境变量文件
env_loaded = load_dotenv('.env.local') or load_dotenv('.env') or load_dotenv()

if not env_loaded:
    print("⚠️  警告: 未找到环境变量文件 (.env.local 或 .env)")
else:
    print("✅ 环境变量文件加载成功")

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 获取 API Key
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# 调试信息
if GEMINI_API_KEY:
    print(f"✅ GEMINI_API_KEY 已加载 (长度: {len(GEMINI_API_KEY)})")
else:
    print("❌ GEMINI_API_KEY 未设置！")
    print("   请检查 .env.local 文件中是否包含 GEMINI_API_KEY")

# 初始化 Gemini Client
client = None
try:
    if GEMINI_API_KEY:
        # 使用 API Key 初始化 Client
        client = genai.Client(api_key=GEMINI_API_KEY)
        print("✅ Gemini Client 初始化成功")
    else:
        print("❌ 无法初始化 Gemini Client：缺少 API Key")
except Exception as e:
    print(f"❌ Gemini Client 初始化失败: {e}")
    import traceback
    traceback.print_exc()
    client = None

# 脚本生成的系统提示词
SCRIPT_SYSTEM_PROMPT = """**角色设定：**
你现在是顶流科普公众号“混知”（Stone历史）的首席脚本作家。你的专长是把极其枯燥、抽象的 AI 技术概念，翻译成连隔壁二傻子都能听懂的爆笑漫画脚本。

**核心任务：**
接收用户输入的一个 AI 概念（如“Embedding”、“Transformer”），创作一个多格漫画脚本（通常为 8-16 格，根据复杂程度定）。

**风格铁律（必须遵守）：**
1.  **强制比喻：** 绝不能直接解释技术！必须找到一个极其生活化、甚至有点荒诞的实体比喻。例如：Token 是“切碎的积木”，算力是“厨师的做菜速度”，模型训练是“填鸭式教育”。
2.  **固定人设：** 故事必须由【呆萌屏脸机器人】（代表死板的 AI 逻辑）和【暴躁吐槽猫】（代表常识人类）共同演绎。猫负责提问、质疑和吐槽，机器人负责用奇葩方式演示，最后出糗。
3.  **语言风格：** 极度口语化、接地气，使用短句、感叹句。夹杂一些网络热梗或略带贱兮兮的语气。拒绝任何专业术语堆砌，除非马上用人话解释它。
4.  **结构要求：** 脚本必须包含四个阶段：起因（猫提出离谱需求）-> 解释（机器人用奇葩比喻演示）-> 冲突/出糗（比喻带来的搞笑副作用）-> 总结（猫的精辟吐槽和一句话知识点）。
5.  **对话要求：** 每一个宫格的漫画内容可以是

**输出格式（严格遵守）：**
请仅输出一个 JSON 数组，不要包含任何 Markdown 标记（如 ```json），不要包含任何开场白或结束语。
JSON 格式示例：
[
  {
    "panelNumber": 1,
    "sceneDescription": "猫丢给机器人一本厚书...",
    "dialogue": "猫：把这书读了..."
  },
  {
    "panelNumber": 2,
    "sceneDescription": "机器人...",
    "dialogue": "机器人：..."
  }
]
"""


@app.route('/health', methods=['GET'])
def health():
    """健康检查"""
    return jsonify({
        "status": "ok",
        "client_initialized": client is not None,
        "has_api_key": bool(GEMINI_API_KEY)
    })


@app.route('/api/generate-script', methods=['POST'])
def generate_script():
    """生成漫画脚本"""
    if not client:
        print("❌ [API] Gemini Client 未初始化")
        return jsonify({
            "success": False,
            "error": "Gemini Client 未初始化"
        }), 500

    try:
        data = request.json
        concept = data.get('concept')
        model = data.get('model', 'gemini-3-pro-preview')

        if not concept:
            print("❌ [API] 缺少 concept 参数")
            return jsonify({
                "success": False,
                "error": "请提供 AI 概念"
            }), 400

        print(f"\n{'='*60}")
        print(f"📝 [API] /api/generate-script 请求")
        print(f"{'='*60}")
        print(f"📝 概念: {concept}")
        print(f"🤖 模型: {model}")
        print(f"⏰ 时间: {get_current_time()}")

        # 构建完整提示词
        prompt = f"{SCRIPT_SYSTEM_PROMPT}\n\n请为以下AI概念创作漫画脚本：{concept}"

        print(f"📤 发送请求到 Gemini API...")

        script_schema = {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "panelNumber": {"type": "INTEGER"},
                    "sceneDescription": {"type": "STRING"},
                    "dialogue": {"type": "STRING"}
                },
                "required": ["panelNumber", "sceneDescription", "dialogue"]
            }
        }

        generate_config = types.GenerateContentConfig(
            max_output_tokens=8192,
            temperature=1.0,
            top_p=0.95,
            response_mime_type="application/json",  # <--- 关键：强制返回 JSON
            response_schema=script_schema           # <--- 关键：约束字段结构
        )

        # 调用 Gemini API
        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=generate_config
        )

        print(f"📥 收到 Gemini API 响应")

        # 提取生成的文本
        generated_text = response.text
        print(f"✅ 脚本生成成功")
        print(f"📊 生成文本长度: {len(generated_text)} 字符")
        print(f"⏰ 完成时间: {get_current_time()}")

        # 尝试解析 JSON
        import json
        try:
            print(f"🔍 尝试解析 JSON...")
            # 提取 JSON 部分（可能包含 markdown 代码块）
            import re
            json_match = re.search(r'\[[\s\S]*\]', generated_text)
            if json_match:
                panels = json.loads(json_match.group(0))
                print(f"✅ 通过正则提取 JSON")
            else:
                panels = json.loads(generated_text)
                print(f"✅ 直接解析 JSON")

            # 重新编号
            for i, panel in enumerate(panels):
                panel['panelNumber'] = i + 1

            print(f"✅ JSON 解析成功")
            print(f"📊 解析面板数: {len(panels)} 格")
            print(f"⏰ 解析完成时间: {get_current_time()}")
            print(f"{'='*60}\n")

            return jsonify({
                "success": True,
                "panels": panels,
                "totalPanels": len(panels),
                "rawText": generated_text
            })

        except json.JSONDecodeError as e:
            print(f"❌ JSON 解析失败: {e}")
            print(f"📄 原始响应前500字符: {generated_text[:500]}")
            print(f"{'='*60}\n")
            return jsonify({
                "success": False,
                "error": "生成的脚本格式错误",
                "rawText": generated_text
            }), 500

    except Exception as e:
        print(f"❌ 脚本生成失败: {e}")
        print(f"⏰ 错误时间: {get_current_time()}")
        import traceback
        traceback.print_exc()
        print(f"{'='*60}\n")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# 确保 style_images 文件夹存在，并且里面有图片
STYLE_DIR = "public/styles/"

@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    """真实调用 Gemini 生成图片 (带风格参考)"""
    if not client:
        return jsonify({"success": False, "error": "Client未初始化"}), 500

    try:
        data = request.json
        panel = data.get('panel')
        style_name = data.get('style', 'default') # 获取风格名称，例如 "cat"
        
        # 1. 自动加载服务器端的风格图片
        style_image_path = os.path.join(STYLE_DIR, f"{style_name}-reference.png")
        reference_image = None
        
        if os.path.exists(style_image_path):
            print(f"🎨 加载风格参考图: {style_image_path}")
            # 打开图片对象
            reference_image = Image.open(style_image_path)
        else:
            print(f"⚠️ 未找到风格图: {style_image_path}，将不使用参考图生成")

        # 2. 构建提示词
        # 注意：Prompt 需要明确告诉 AI 这是一个"风格参考"
        prompt_text = (
            f"Create a manga panel based on this style reference image. "
            f"Scene: {panel.get('sceneDescription')}. "
            f"Characters: A cute robot and a grumpy cat. "
            f"Dialogue context: {panel.get('dialogue')}. "
            f"Make sure the visual style matches the reference image provided."
        )

        # 3. 构建请求内容
        # 根据 Google 示例，contents 是一个列表，可以包含文本和图片对象
        contents = [prompt_text]
        if reference_image:
            contents.append(reference_image)

        print(f"📤 发送图片生成请求 (Model: gemini-3-pro-image-preview)...")

        # 4. 调用 API
        # 注意：你需要确认你的 API Key 有权限访问支持图片输出的模型
        # 目前如果是标准的 Gemini 2.0 Flash，它主要是多模态输入，文本输出。
        # 如果你使用的是支持生图的模型（如 Imagen 3 或特定的 gemini-image 模型），请修改 model 参数
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview", # 或者 "gemini-2.5-flash-image" 如果你有权限
            contents=contents
        )

        # 5. 处理响应 (解析图片)
        generated_image_b64 = None
        
        # --- 修改开始：使用更稳健的路径获取 parts ---
        try:
            # 检查是否有 candidates
            if response.candidates and len(response.candidates) > 0:
                # 获取第一个候选内容的 parts
                # 路径: response -> candidates[0] -> content -> parts
                parts = response.candidates[0].content.parts
                
                for part in parts:
                    # 检查是否有 inline_data (二进制图片数据)
                    if part.inline_data:
                        print(f"✅ 收到图片数据 (MimeType: {part.inline_data.mime_type})")
                        
                        # 获取二进制数据
                        image_bytes = part.inline_data.data
                        
                        # 转换为 Base64
                        generated_image_b64 = base64.b64encode(image_bytes).decode('utf-8')
                        break
                    
                    # 某些旧版本或特定情况可能返回 image 对象（保留此逻辑以防万一）
                    elif hasattr(part, 'image') and part.image:
                         print("✅ 收到图片对象 (PIL)")
                         buf = io.BytesIO()
                         part.image.save(buf, format='PNG')
                         generated_image_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
                         break
            else:
                print("⚠️ 响应中没有 candidates")

        except AttributeError as e:
            print(f"⚠️ 解析响应结构时出错: {e}")
            # 再次打印结构以便调试
            print(response)
        # --- 修改结束 ---

        if generated_image_b64:
            return jsonify({
                "success": True,
                "imageData": generated_image_b64
            })
        else:
            # 如果没生成图片，可能是模型拒绝了或者输出了文本拒绝理由
            text_response = response.text if response.text else "未知错误"
            print(f"❌ 未收到图片数据，模型返回文本: {text_response}")
            return jsonify({
                "success": False,
                "error": f"生成失败，模型未返回图片。模型回复: {text_response}"
            }), 500

    except Exception as e:
        print(f"❌ 图片生成异常: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/regenerate-image', methods=['POST'])
def regenerate_image():
    """重新生成图片"""
    # 复用生成图片的逻辑
    return generate_image()


if __name__ == '__main__':
    port = 3001
    print(f"\n{'='*60}")
    print(f"🚀 Gemini API 代理服务器")
    print(f"{'='*60}")
    print(f"✅ 服务器地址: http://127.0.0.1:{port}")
    print(f"✅ 使用 Python Google SDK")
    print(f"✅ 自动支持系统代理")
    print(f"{'='*60}")
    print(f"\n📡 可用端点:")
    print(f"  GET  /health - 健康检查")
    print(f"  POST /api/generate-script - 生成脚本")
    print(f"  POST /api/generate-image - 生成图片")
    print(f"  POST /api/regenerate-image - 重新生成图片")
    print(f"\n🎯 启动服务器...\n")

    app.run(host='127.0.0.1', port=port, debug=False)
