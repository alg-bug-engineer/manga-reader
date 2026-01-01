#!/usr/bin/env python3
"""
测试 Gemini API 响应结构
帮助调试图片生成问题
"""

import os
from dotenv import load_dotenv
import google.genai as genai
from PIL import Image
import io

# 加载环境变量
load_dotenv('.env.local')

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not GEMINI_API_KEY:
    print("❌ GEMINI_API_KEY 未设置")
    exit(1)

print("✅ API Key 已加载")

# 初始化客户端
client = genai.Client(api_key=GEMINI_API_KEY)
print("✅ Gemini Client 初始化成功\n")

# 测试图片生成
print("="*60)
print("测试图片生成")
print("="*60)

prompt = """Create a simple manga panel illustration.
Scene: A cute robot waving hello.
Style: Simple black and white line art."""

print(f"📝 提示词: {prompt}\n")

try:
    print("📤 调用 Gemini API...")

    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=prompt
    )

    print("✅ 收到响应\n")

    # 打印响应类型
    print(f"📋 响应类型: {type(response)}")
    print(f"📋 响应属性列表:\n   {', '.join([attr for attr in dir(response) if not attr.startswith('_')])}\n")

    # 检查各种可能的属性
    print("="*60)
    print("检查响应结构")
    print("="*60)

    # 检查 candidates
    if hasattr(response, 'candidates'):
        print(f"✅ 有 'candidates' 属性")
        print(f"   candidates 数量: {len(response.candidates) if response.candidates else 0}")

        if response.candidates:
            first_candidate = response.candidates[0]
            print(f"   第一个 candidate 类型: {type(first_candidate)}")
            print(f"   第一个 candidate 属性: {[attr for attr in dir(first_candidate) if not attr.startswith('_')]}")

            if hasattr(first_candidate, 'content'):
                print(f"   ✅ candidate.content 存在")
                print(f"   content 类型: {type(first_candidate.content)}")
                print(f"   content 属性: {[attr for attr in dir(first_candidate.content) if not attr.startswith('_')]}")

                if hasattr(first_candidate.content, 'parts'):
                    print(f"   ✅ content.parts 存在")
                    print(f"   parts 数量: {len(first_candidate.content.parts)}")

                    for i, part in enumerate(first_candidate.content.parts):
                        print(f"\n   Part {i+1}:")
                        print(f"     类型: {type(part)}")
                        print(f"     属性: {[attr for attr in dir(part) if not attr.startswith('_')]}")

                        if hasattr(part, 'inline_data'):
                            print(f"     ✅ 有 inline_data: {part.inline_data is not None}")
                            if part.inline_data:
                                print(f"     inline_data 类型: {type(part.inline_data)}")
                                print(f"     inline_data 属性: {[attr for attr in dir(part.inline_data) if not attr.startswith('_')]}")
                                if hasattr(part.inline_data, 'data'):
                                    print(f"     ✅ data 长度: {len(part.inline_data.data)} bytes")

                        if hasattr(part, 'text'):
                            print(f"     ✅ 有 text: {part.text is not None}")
                            if part.text:
                                print(f"     文本内容: {part.text[:100]}")
    else:
        print("❌ 没有 'candidates' 属性")

    # 检查 parts（直接在 response 上）
    if hasattr(response, 'parts'):
        print(f"\n✅ 有 'parts' 属性（直接在 response 上）")
        print(f"   parts 数量: {len(response.parts) if response.parts else 0}")
    else:
        print(f"\n❌ 没有 'parts' 属性（直接在 response 上）")

    # 检查 text
    if hasattr(response, 'text'):
        print(f"\n✅ 有 'text' 属性")
        if response.text:
            print(f"   文本长度: {len(response.text)}")
            print(f"   文本内容: {response.text[:200]}")
        else:
            print(f"   文本为空")
    else:
        print(f"\n❌ 没有 'text' 属性")

    print("\n" + "="*60)
    print("测试完成")
    print("="*60)

except Exception as e:
    print(f"❌ 错误: {e}")
    import traceback
    traceback.print_exc()
