import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """应用配置类"""
    
    # 企业微信配置
    CORP_ID = os.getenv('CORP_ID')
    CORP_SECRET = os.getenv('CORP_SECRET')
    AGENT_ID = os.getenv('AGENT_ID')
    
    # Flask配置
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    
    # 数据库配置
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    
    # 企业微信API配置
    WECHAT_API_BASE_URL = 'https://qyapi.weixin.qq.com/cgi-bin'
    WECHAT_OAUTH_BASE_URL = 'https://open.weixin.qq.com/connect/oauth2/authorize'
    
    # 应用配置
    APP_NAME = '企业微信应用'
    APP_VERSION = '1.0.0'
    
    @classmethod
    def validate_config(cls):
        """验证配置是否完整"""
        required_vars = ['CORP_ID', 'CORP_SECRET', 'AGENT_ID']
        missing_vars = []
        
        for var in required_vars:
            if not getattr(cls, var):
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"缺少必要的环境变量: {', '.join(missing_vars)}")
        
        return True

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """测试环境配置"""
    DEBUG = True
    TESTING = True
    DATABASE_URL = 'sqlite:///:memory:'

# 配置字典
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
