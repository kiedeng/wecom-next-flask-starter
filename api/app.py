from flask import Flask, request, jsonify, redirect, render_template
from flask_cors import CORS
import requests
import hashlib
import time
import random
import string
import json
import os
from dotenv import load_dotenv
from config import Config

load_dotenv()

app = Flask(__name__)
CORS(app)  # 启用CORS支持

# 企业微信配置
CORP_ID = os.getenv('CORP_ID')  # 企业ID
CORP_SECRET = os.getenv('CORP_SECRET')  # 应用Secret
AGENT_ID = os.getenv('AGENT_ID')  # 应用ID
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

class WeChatWorkSDK:
    def __init__(self, corp_id, corp_secret, agent_id):
        self.corp_id = corp_id
        self.corp_secret = corp_secret
        self.agent_id = agent_id
        self.access_token = None
        self.token_expires_at = 0
        self.jsapi_ticket = None
        self.ticket_expires_at = 0
    
    def get_access_token(self):
        """获取access_token"""
        if self.access_token and time.time() < self.token_expires_at:
            return self.access_token
        
        url = f"https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid={self.corp_id}&corpsecret={self.corp_secret}"
        try:
            response = requests.get(url, timeout=10)
            data = response.json()
            
            if data.get('errcode') == 0:
                self.access_token = data['access_token']
                self.token_expires_at = time.time() + data['expires_in'] - 60  # 提前60秒过期
                return self.access_token
            else:
                raise Exception(f"获取access_token失败: {data.get('errmsg', '未知错误')}")
        except requests.RequestException as e:
            raise Exception(f"请求access_token时网络错误: {str(e)}")
    
    def get_jsapi_ticket(self):
        """获取jsapi_ticket"""
        if self.jsapi_ticket and time.time() < self.ticket_expires_at:
            return self.jsapi_ticket
        
        access_token = self.get_access_token()
        url = f"https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket?access_token={access_token}"
        
        try:
            response = requests.get(url, timeout=10)
            data = response.json()
            
            if data.get('errcode') == 0:
                self.jsapi_ticket = data['ticket']
                self.ticket_expires_at = time.time() + data['expires_in'] - 60
                return self.jsapi_ticket
            else:
                raise Exception(f"获取jsapi_ticket失败: {data.get('errmsg', '未知错误')}")
        except requests.RequestException as e:
            raise Exception(f"请求jsapi_ticket时网络错误: {str(e)}")
    
    def generate_jsapi_signature(self, url):
        """生成JS-SDK签名"""
        jsapi_ticket = self.get_jsapi_ticket()
        
        # 生成签名参数
        timestamp = int(time.time())
        nonce_str = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
        
        # 生成签名字符串
        sign_string = f"jsapi_ticket={jsapi_ticket}&noncestr={nonce_str}&timestamp={timestamp}&url={url}"
        signature = hashlib.sha1(sign_string.encode('utf-8')).hexdigest()
        
        return {
            'appId': self.corp_id,
            'timestamp': timestamp,
            'nonceStr': nonce_str,
            'signature': signature
        }
    
    def get_user_info(self, code):
        """通过授权码获取用户信息"""
        access_token = self.get_access_token()
        url = f"https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token={access_token}&code={code}"
        
        try:
            response = requests.get(url, timeout=10)
            data = response.json()
            
            if data.get('errcode') == 0:
                return data
            else:
                raise Exception(f"获取用户信息失败: {data.get('errmsg', '未知错误')}")
        except requests.RequestException as e:
            raise Exception(f"请求用户信息时网络错误: {str(e)}")
    
    def get_user_detail(self, userid):
        """获取用户详细信息"""
        access_token = self.get_access_token()
        url = f"https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token={access_token}&userid={userid}"
        
        try:
            response = requests.get(url, timeout=10)
            data = response.json()
            
            if data.get('errcode') == 0:
                return data
            else:
                raise Exception(f"获取用户详细信息失败: {data.get('errmsg', '未知错误')}")
        except requests.RequestException as e:
            raise Exception(f"请求用户详细信息时网络错误: {str(e)}")
    
    def send_message(self, userid, message_type, content):
        """发送消息到企业微信"""
        access_token = self.get_access_token()
        url = f"https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token={access_token}"
        
        # 构建消息体
        message_data = {
            "touser": userid,
            "msgtype": message_type,
            "agentid": self.agent_id
        }
        
        if message_type == "text":
            message_data["text"] = {"content": content}
        elif message_type == "markdown":
            message_data["markdown"] = {"content": content}
        
        try:
            response = requests.post(url, json=message_data, timeout=10)
            data = response.json()
            
            if data.get('errcode') == 0:
                return data
            else:
                raise Exception(f"发送消息失败: {data.get('errmsg', '未知错误')}")
        except requests.RequestException as e:
            raise Exception(f"发送消息时网络错误: {str(e)}")
    
    def get_oauth_url(self, redirect_uri, state=""):
        """生成OAuth授权URL"""
        params = {
            'appid': self.corp_id,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'scope': 'snsapi_base',
            'state': state
        }
        
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        return f"https://open.weixin.qq.com/connect/oauth2/authorize?{query_string}#wechat_redirect"

# 初始化企业微信SDK
wechat_sdk = WeChatWorkSDK(CORP_ID, CORP_SECRET, AGENT_ID)

@app.route('/')
def index():
    """API根路径"""
    return jsonify({
        'message': '企业微信应用API服务',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'config': '/api/wechat/config',
            'user_info': '/api/user/info',
            'send_message': '/api/send/message',
            'oauth_callback': '/oauth/callback',
            'oauth_url': '/api/oauth/url'
        }
    })

@app.route('/api/wechat/config')
def get_wechat_config():
    """获取企业微信JS-SDK配置"""
    try:
        # 获取前端传递的URL，如果没有则使用默认值
        url = request.args.get('url')
        referer = request.headers.get('Referer', '')
        request_url = request.url
        
        print(f"=== 企业微信配置调试信息 ===")
        print(f"请求URL参数: {url}")
        print(f"Referer头: {referer}")
        print(f"当前请求URL: {request_url}")
        print(f"请求头信息: {dict(request.headers)}")
        
        if not url:
            # 如果没有传递URL，使用请求的referer或默认值
            url = referer or request.url_root.rstrip('/')
        
        # 确保URL格式正确（移除fragment部分）
        if '#' in url:
            url = url.split('#')[0]
        
        # 清理URL，移除不必要的查询参数
        try:
            from urllib.parse import urlparse, urlunparse
            parsed = urlparse(url)
            # 只保留协议、域名和路径，移除查询参数和fragment
            clean_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path, '', '', ''))
            print(f"清理后的URL: {clean_url}")
            url = clean_url
        except Exception as e:
            print(f"URL清理失败: {e}")
        
        print(f"最终用于生成签名的URL: {url}")
        
        signature_config = wechat_sdk.generate_jsapi_signature(url)
        
        print(f"生成的配置: {signature_config}")
        print(f"=== 调试信息结束 ===")
        
        return jsonify({
            'success': True,
            'data': signature_config
        })
    except Exception as e:
        print(f"配置生成失败: {str(e)}")  # 调试日志
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/user/info')
def get_user_info():
    """获取用户信息（需要先进行OAuth授权）"""
    code = request.args.get('code')
    if not code:
        return jsonify({'success': False, 'error': '缺少授权码'}), 400
    
    try:
        user_info = wechat_sdk.get_user_info(code)
        
        # 如果有用户ID，获取详细信息
        if user_info.get('UserId'):
            try:
                user_detail = wechat_sdk.get_user_detail(user_info['UserId'])
                user_info.update(user_detail)
            except Exception as e:
                # 获取详细信息失败不影响基本信息
                pass
        
        return jsonify({
            'success': True,
            'data': user_info
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/oauth/url')
def get_oauth_url():
    """获取OAuth授权URL"""
    try:
        redirect_uri = request.args.get('redirect_uri', f"{FRONTEND_URL}/oauth/callback")
        state = request.args.get('state', '')
        
        oauth_url = wechat_sdk.get_oauth_url(redirect_uri, state)
        
        return jsonify({
            'success': True,
            'data': {
                'oauth_url': oauth_url,
                'redirect_uri': redirect_uri,
                'state': state
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/oauth/callback')
def oauth_callback():
    """OAuth授权回调"""
    code = request.args.get('code')
    state = request.args.get('state', '')
    
    if code:
        # 重定向到前端页面，携带授权码
        redirect_url = f"{FRONTEND_URL}/?code={code}&state={state}"
        return redirect(redirect_url)
    else:
        return jsonify({
            'success': False,
            'error': '授权失败，请重试'
        }), 400

@app.route('/api/send/message', methods=['POST'])
def send_message():
    """发送消息到企业微信"""
    try:
        data = request.get_json()
        userid = data.get('userid')
        message_type = data.get('type', 'text')
        content = data.get('content', '')
        
        if not userid:
            return jsonify({'success': False, 'error': '用户ID不能为空'}), 400
        
        if not content:
            return jsonify({'success': False, 'error': '消息内容不能为空'}), 400
        
        # 发送消息到企业微信
        result = wechat_sdk.send_message(userid, message_type, content)
        
        return jsonify({
            'success': True,
            'message': '消息发送成功',
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health')
def health_check():
    """健康检查接口"""
    try:
        # 检查企业微信配置
        Config.validate_config()
        return jsonify({
            'success': True,
            'status': 'healthy',
            'timestamp': int(time.time())
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': int(time.time())
        }), 500

@app.route('/api/debug/info')
def get_debug_info():
    """获取调试信息接口"""
    try:
        # 获取最近的企业微信配置请求信息
        debug_data = {
            'timestamp': int(time.time()),
            'message': '调试信息接口正常',
            'tips': [
                '查看后端终端日志获取详细调试信息',
                '前端调试信息会在页面上显示',
                '确保前后端URL一致'
            ]
        }
        
        return jsonify({
            'success': True,
            'data': debug_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'API接口不存在'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': '服务器内部错误'
    }), 500

if __name__ == '__main__':
    # 检查必要的环境变量
    required_vars = ['CORP_ID', 'CORP_SECRET', 'AGENT_ID']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"错误：缺少必要的环境变量: {', '.join(missing_vars)}")
        print("请在.env文件中配置这些变量")
        exit(1)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
