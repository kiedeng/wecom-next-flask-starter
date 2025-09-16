#!/usr/bin/env python3
"""
企业微信应用启动脚本
"""

import os
import sys
from app import app
from config import Config

def main():
    """主函数"""
    try:
        # 验证配置
        Config.validate_config()
        print("✅ 配置验证通过")
        
        # 获取配置
        host = Config.HOST
        port = Config.PORT
        debug = Config.DEBUG
        
        print(f"🚀 启动企业微信应用...")
        print(f"📍 访问地址: http://{host}:{port}")
        print(f"🔧 调试模式: {'开启' if debug else '关闭'}")
        print(f"🏢 企业ID: {Config.CORP_ID}")
        print(f"📱 应用ID: {Config.AGENT_ID}")
        print("-" * 50)
        
        # 启动应用
        app.run(
            host=host,
            port=port,
            debug=debug,
            threaded=True
        )
        
    except ValueError as e:
        print(f"❌ 配置错误: {e}")
        print("请检查 .env 文件中的配置")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 应用已停止")
        sys.exit(0)
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
