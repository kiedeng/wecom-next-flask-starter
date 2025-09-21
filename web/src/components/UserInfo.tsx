'use client';

import React from 'react';
import { useWeChat } from '@/hooks/useWeChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { User, Mail, Phone, Building, MapPin, Loader2 } from 'lucide-react';

export function UserInfo() {
  const { userInfo, loading, error, getUserInfo, isInWeChat } = useWeChat();

  const handleGetUserInfo = async () => {
    try {
      // 不再需要传递code参数，API会自动从请求头获取
      await getUserInfo();
    } catch (err) {
      console.error('获取用户信息失败:', err);
    }
  };

  if (!isInWeChat) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>用户信息</CardTitle>
          <CardDescription>
            请在企业微信中打开此应用以获取用户信息
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>用户信息</CardTitle>
          <CardDescription>正在获取用户信息...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>用户信息</CardTitle>
          <CardDescription>获取用户信息时发生错误</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={handleGetUserInfo}>
              重新获取用户信息
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  

  return (
    <Card>
      <CardHeader>
        <CardTitle>用户信息</CardTitle>
        <CardDescription>您的企业微信用户信息</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userInfo.UserId && (
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">用户ID</p>
                <p className="text-sm text-gray-600">{userInfo.UserId}</p>
              </div>
            </div>
          )}
          
          {userInfo.name && (
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">姓名</p>
                <p className="text-sm text-gray-600">{userInfo.name}</p>
              </div>
            </div>
          )}
          
          {userInfo.mobile && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">手机号</p>
                <p className="text-sm text-gray-600">{userInfo.mobile}</p>
              </div>
            </div>
          )}
          
          {userInfo.email && (
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">邮箱</p>
                <p className="text-sm text-gray-600">{userInfo.email}</p>
              </div>
            </div>
          )}
          
          {userInfo.position && (
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">职位</p>
                <p className="text-sm text-gray-600">{userInfo.position}</p>
              </div>
            </div>
          )}
          
          {userInfo.department && userInfo.department.length > 0 && (
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">部门</p>
                <p className="text-sm text-gray-600">{userInfo.department.join(', ')}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t">
          <Button variant="outline" onClick={handleGetUserInfo}>
            刷新用户信息
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
