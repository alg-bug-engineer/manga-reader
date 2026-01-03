# Gemini API 图片生成问题诊断和解决方案

## 问题分析

### 错误信息
```
AttributeError: 'GenerateContentResponse' object has no attribute 'parts'
```

### 根本原因

**Gemini 模型不支持图片生成！**

- ❌ `gemini-2.0-flash-exp` - 只支持文本生成
- ❌ `gemini-1.5-pro` - 只支持文本理解和分析图片
- ❌ `gemini-1.5-flash` - 只支持文本理解和分析图片

### 正确的图片生成方案

Google 提供了 **Imagen** 模型用于图片生成，但调用方式和 Gemini 不同。

## 方案一：使用 Imagen API（推荐）

### 安装依赖
```bash
uv pip install google-cloud-aiplatform
```

### 使用 Imagen 生成图片

```python
from google.cloud import aiplatform
import base64

# 初始化
aiplatform.init(project="your-project-id", location="us-central1")

# 调用 Imagen
model = aiplatform.Model("imagen-3.0-generate-001")

response = model.predict(
    prompt="A cute robot and a grumpy cat in manga style",
    parameters={
        "sample_count": 1,
        "aspect_ratio": "1:1"
    }
)

# 获取图片
image_base64 = response.predictions[0].bytes_base64
image_data = base64.b64decode(image_base64)
```

## 方案二：继续使用 Gemini（但只能分析图片）

如果你只是想**理解**或**描述**图片，而不是生成新图片：

```python
from google import genai

client = genai.Client(api_key=GEMINI_API_KEY)

# 上传图片并让 Gemini 分析
response = client.models.generate_content(
    model="gemini-2.0-flash-exp",
    contents=["Describe this image", image_file]
)

print(response.text)  # 文本描述
```

## 方案三：使用其他图片生成服务

### 选项 A: OpenAI DALL-E
```python
from openai import OpenAI

client = OpenAI(api_key="your-key")

response = client.images.generate(
    model="dall-e-3",
    prompt="A cute robot and a grumpy cat",
    size="1024x1024"
)

image_url = response.data[0].url
```

### 选项 B: Stability AI
```python
import stability_sdk

client = stability_sdk.Client()

response = client.generate(
    prompt="A cute robot and a grumpy cat",
    steps=30
)
```

## 当前项目的最佳方案

考虑到项目架构，建议：

1. **脚本生成**: 继续使用 Gemini ✅
   ```
   gemini-2.0-flash-exp - 完美支持
   ```

2. **图片生成**: 需要切换到 Imagen 或其他服务

### 快速修复

#### 选项 1: 添加 DALL-E 支持

1. 安装依赖:
```bash
npm install openai
```

2. 更新 `gemini_proxy_server.py`:

```python
@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    # ... 获取参数 ...

    # 使用 OpenAI DALL-E
    from openai import OpenAI

    openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

    prompt = f"""Create a manga panel: {panel.get('sceneDescription')}
Characters: A cute robot with a screen face and a grumpy cat.
Dialogue: {panel.get('dialogue')}
Style: {style_prompts.get(style, style)}"""

    response = openai_client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1024x1024",
        quality="standard",
        n=1,
    )

    image_url = response.data[0].url

    # 下载图片并返回 base64
    import requests
    image_response = requests.get(image_url)
    image_data = base64.b64encode(image_response.content).decode('utf-8')

    return jsonify({
        "success": True,
        "imageData": image_data
    })
```

3. 更新 `.env.local`:
```
OPENAI_API_KEY=your-openai-key
```

#### 选项 2: 使用 Imagen（需要 GCP 项目）

1. 安装依赖:
```bash
uv pip install google-cloud-aiplatform
```

2. 配置 GCP 认证:
```bash
gcloud auth application-default login
```

3. 更新代码使用 Imagen API

## 临时解决方案

如果只是想测试流程，可以：

1. **返回占位图片**
```python
# 生成一个简单的占位图片
from PIL import Image, ImageDraw, ImageFont

img = Image.new('RGB', (512, 512), color='white')
draw = ImageDraw.Draw(img)
draw.text((256, 256), f"Panel {panel.get('panelNumber')}", fill='black')

buffer = io.BytesIO()
img.save(buffer, format='PNG')
image_data = base64.b64encode(buffer.getvalue()).decode('utf-8')

return jsonify({
    "success": True,
    "imageData": image_data
})
```

2. **使用静态图片库**
```python
# 返回预设的漫画格图片
import random

placeholder_images = [
    "base64_encoded_image_1",
    "base64_encoded_image_2",
    # ...
]

image_data = random.choice(placeholder_images)
```

## 建议的行动步骤

1. ✅ **短期**: 使用占位图片或 DALL-E
2. ⏳ **中期**: 评估 Imagen 或其他图片生成服务
3. 🎯 **长期**: 根据成本和质量选择最佳方案

## 需要帮助？

- 检查 [Google Imagen 文档](https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview)
- 检查 [OpenAI DALL-E 文档](https://platform.openai.com/docs/guides/images)
- 测试脚本生成是否正常工作
