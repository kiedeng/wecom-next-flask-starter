#!/usr/bin/env python3
"""
企业微信应用API测试脚本
用于验证API服务是否正常运行
"""

import requests
import json
import sys
import time

# API基础URL
API_BASE_URL = "http://localhost:5000"

def test_health_check():
    """测试健康检查接口"""
    print("🔍 测试健康检查接口...")
    try:
        response = requests.get(f"{API_BASE_URL}/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ 健康检查通过")
                return True
            else:
                print(f"❌ 健康检查失败: {data.get('error')}")
                return False
        else:
            print(f"❌ 健康检查失败: HTTP {response.status_code}")
            return False
    except requests.RequestException as e:
        print(f"❌ 健康检查失败: {e}")
        return False

def test_root_endpoint():
    """测试根接口"""
    print("🔍 测试根接口...")
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ 根接口正常")
            print(f"   消息: {data.get('message')}")
            print(f"   版本: {data.get('version')}")
            return True
        else:
            print(f"❌ 根接口失败: HTTP {response.status_code}")
            return False
    except requests.RequestException as e:
        print(f"❌ 根接口失败: {e}")
        return False

def test_wechat_config():
    """测试企业微信配置接口"""
    print("🔍 测试企业微信配置接口...")
    try:
        response = requests.get(f"{API_BASE_URL}/api/wechat/config", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                config = data.get('data', {})
                print("✅ 企业微信配置接口正常")
                print(f"   AppId: {config.get('appId', 'N/A')}")
                print(f"   时间戳: {config.get('timestamp', 'N/A')}")
                return True
            else:
                print(f"❌ 企业微信配置失败: {data.get('error')}")
                return False
        else:
            print(f"❌ 企业微信配置失败: HTTP {response.status_code}")
            return False
    except requests.RequestException as e:
        print(f"❌ 企业微信配置失败: {e}")
        return False

def test_oauth_url():
    """测试OAuth URL接口"""
    print("🔍 测试OAuth URL接口...")
    try:
        response = requests.get(f"{API_BASE_URL}/api/oauth/url", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                oauth_data = data.get('data', {})
                print("✅ OAuth URL接口正常")
                print(f"   回调地址: {oauth_data.get('redirect_uri', 'N/A')}")
                return True
            else:
                print(f"❌ OAuth URL失败: {data.get('error')}")
                return False
        else:
            print(f"❌ OAuth URL失败: HTTP {response.status_code}")
            return False
    except requests.RequestException as e:
        print(f"❌ OAuth URL失败: {e}")
        return False

def test_send_message():
    """测试发送消息接口"""
    print("🔍 测试发送消息接口...")
    try:
        # 测试数据
        test_data = {
            "userid": "test_user",
            "type": "text",
            "content": "测试消息"
        }
        
        response = requests.post(
            f"{API_BASE_URL}/api/send/message",
            json=test_data,
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ 发送消息接口正常")
                return True
            else:
                print(f"❌ 发送消息失败: {data.get('error')}")
                return False
        else:
            print(f"❌ 发送消息失败: HTTP {response.status_code}")
            return False
    except requests.RequestException as e:
        print(f"❌ 发送消息失败: {e}")
        return False

def main():
    """主测试函数"""
    print("🚀 开始测试企业微信应用API...")
    print(f"📡 API地址: {API_BASE_URL}")
    print("-" * 50)
    
    tests = [
        test_health_check,
        test_root_endpoint,
        test_wechat_config,
        test_oauth_url,
        test_send_message,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ 测试异常: {e}")
        print()
    
    print("-" * 50)
    print(f"📊 测试结果: {passed}/{total} 通过")
    
    if passed == total:
        print("🎉 所有测试通过！API服务运行正常")
        return 0
    else:
        print("⚠️  部分测试失败，请检查API服务配置")
        return 1

if __name__ == "__main__":
    sys.exit(main())
