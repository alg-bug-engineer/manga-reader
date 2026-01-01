#!/usr/bin/env python3
"""
Gemini API 代理服务器测试脚本
使用 uv 管理的环境进行测试
"""

import requests
import json
import sys

# 服务器配置
SERVER_URL = "http://127.0.0.1:3001"

def print_section(title):
    """打印分节标题"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_health_check():
    """测试健康检查"""
    print_section("1️⃣  健康检查测试")

    try:
        response = requests.get(f"{SERVER_URL}/health", timeout=5)

        if response.status_code == 200:
            data = response.json()
            print("✅ 健康检查通过")
            print(f"   状态: {data.get('status')}")
            print(f"   客户端初始化: {data.get('client_initialized')}")
            print(f"   API Key 存在: {data.get('has_api_key')}")
            return data.get('client_initialized') and data.get('has_api_key')
        else:
            print(f"❌ 健康检查失败: HTTP {response.status_code}")
            return False

    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到服务器")
        print("   请确保服务器正在运行: ./start-proxy-server.sh")
        return False
    except Exception as e:
        print(f"❌ 健康检查出错: {e}")
        return False

def test_generate_script():
    """测试脚本生成"""
    print_section("2️⃣  脚本生成测试")

    test_concept = "Transformer"

    try:
        print(f"📝 测试概念: {test_concept}")

        payload = {
            "concept": test_concept,
            "model": "gemini-2.0-flash-exp"
        }

        print(f"📡 发送请求到 {SERVER_URL}/api/generate-script")

        response = requests.post(
            f"{SERVER_URL}/api/generate-script",
            json=payload,
            timeout=120
        )

        print(f"📊 响应状态码: {response.status_code}")

        if response.status_code == 200:
            data = response.json()

            if data.get('success'):
                panels = data.get('panels', [])
                print(f"✅ 脚本生成成功!")
                print(f"   总格数: {data.get('totalPanels')}")
                print(f"   返回面板数: {len(panels)}")

                if panels:
                    print(f"\n   第一格预览:")
                    first_panel = panels[0]
                    print(f"   - 场景: {first_panel.get('sceneDescription', 'N/A')[:80]}...")
                    print(f"   - 对话: {first_panel.get('dialogue', 'N/A')[:80]}...")

                return True
            else:
                print(f"❌ 脚本生成失败: {data.get('error')}")
                if data.get('rawText'):
                    print(f"   原始响应: {data.get('rawText')[:200]}...")
                return False
        else:
            print(f"❌ HTTP 错误: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   错误信息: {error_data}")
            except:
                print(f"   响应内容: {response.text[:200]}")
            return False

    except requests.exceptions.Timeout:
        print("❌ 请求超时 (120秒)")
        return False
    except Exception as e:
        print(f"❌ 脚本生成出错: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_generate_image():
    """测试图片生成"""
    print_section("3️⃣  图片生成测试")

    test_panel = {
        "panelNumber": 1,
        "sceneDescription": "一个可爱的机器人和一只猫在讨论AI技术",
        "dialogue": "机器人：你知道吗，Transformer就像是一个精密的翻译官！"
    }

    try:
        print(f"🎨 测试面板: 第 {test_panel['panelNumber']} 格")

        payload = {
            "panel": test_panel,
            "style": "peach",
            "model": "gemini-2.0-flash-exp"
        }

        print(f"📡 发送请求到 {SERVER_URL}/api/generate-image")

        response = requests.post(
            f"{SERVER_URL}/api/generate-image",
            json=payload,
            timeout=120
        )

        print(f"📊 响应状态码: {response.status_code}")

        if response.status_code == 200:
            data = response.json()

            if data.get('success'):
                image_data = data.get('imageData')
                print(f"✅ 图片生成成功!")
                print(f"   图片数据大小: {len(image_data)} bytes")
                print(f"   (~{len(image_data) / 1024:.1f} KB)")
                return True
            else:
                print(f"❌ 图片生成失败: {data.get('error')}")
                return False
        else:
            print(f"❌ HTTP 错误: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   错误信息: {error_data}")
            except:
                print(f"   响应内容: {response.text[:200]}")
            return False

    except requests.exceptions.Timeout:
        print("❌ 请求超时 (120秒)")
        return False
    except Exception as e:
        print(f"❌ 图片生成出错: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主测试函数"""
    print("\n🧪 Gemini API 代理服务器测试")
    print("="*60)

    results = {
        "健康检查": False,
        "脚本生成": False,
        "图片生成": False
    }

    # 1. 健康检查
    results["健康检查"] = test_health_check()

    if not results["健康检查"]:
        print("\n❌ 服务器未就绪，停止测试")
        print("   请检查:")
        print("   1. 服务器是否正在运行: ./start-proxy-server.sh")
        print("   2. .env.local 文件是否存在并包含 GEMINI_API_KEY")
        sys.exit(1)

    # 2. 脚本生成测试
    results["脚本生成"] = test_generate_script()

    # 3. 图片生成测试
    results["图片生成"] = test_generate_image()

    # 总结
    print_section("📋 测试总结")

    for test_name, passed in results.items():
        status = "✅ 通过" if passed else "❌ 失败"
        print(f"   {test_name}: {status}")

    all_passed = all(results.values())

    if all_passed:
        print(f"\n🎉 所有测试通过！服务器运行正常")
        return 0
    else:
        print(f"\n⚠️  部分测试失败，请检查日志")
        return 1

if __name__ == "__main__":
    sys.exit(main())
