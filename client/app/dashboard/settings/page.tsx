"use client";

import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '@/app/services/authService';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [nickname, setNickname] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
        setNickname(userData.nick_name || '');
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaveError('');
      setSaveSuccess(false);

      // 检查密码是否一致
      if (newPassword && newPassword !== confirmPassword) {
        setPasswordError('两次输入的密码不一致');
        return;
      }
      
      // 密码一致，清除错误信息
      setPasswordError('');
      
      // 准备更新数据
      const updateData: any = {
        nick_name: nickname
      };

      // 如果输入了新密码，则添加密码更新
      if (newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      // 发送更新请求
      const response = await axios.put(`${API_URL}/users/profile`, updateData, {
        withCredentials: true
      });

      if (response.status === 200) {
        setSaveSuccess(true);
        // 清空密码字段
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // 重新获取用户数据
        await fetchUserData();
      }
    } catch (error: any) {
      setSaveError(error.response?.data?.message || '保存失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-[800px]">
        <h1 className="text-2xl font-medium mb-6">设置</h1>
        
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-bold font-medium mb-4">个人资料</h2>
          
          <div className="grid grid-cols-[180px_1fr] gap-4 items-center mb-4">
            <label className="text-sm">邮箱</label>
            <div>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-[300px] p-2 border rounded text-gray-500 bg-gray-50"
              />
              <span className="text-gray-400 text-sm ml-3">不可修改</span>
            </div>
          </div>
          
          <div className="grid grid-cols-[180px_1fr] gap-4 items-center">
            <label className="text-sm">昵称</label>
            <div>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入您的昵称"
                className="w-[300px] p-2 border rounded"
              />
              <span className="text-gray-400 text-sm ml-3">最多30个字符</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-bold font-medium mb-4">修改密码</h2>
          
          <div className="grid grid-cols-[180px_1fr] gap-4 items-center mb-4">
            <label className="text-sm">当前密码</label>
            <div>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-[300px] p-2 border rounded"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-[180px_1fr] gap-4 items-center mb-4">
            <label className="text-sm">新密码</label>
            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-[300px] p-2 border rounded"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-[180px_1fr] gap-4 items-center">
            <label className="text-sm">确认新密码</label>
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-[300px] p-2 border rounded ${passwordError ? 'border-red-500' : ''}`}
              />
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>
          </div>
        </div>
        
        {saveError && (
          <div className="mb-4 text-red-500 text-sm">{saveError}</div>
        )}
        
        {saveSuccess && (
          <div className="mb-4 text-green-500 text-sm">保存成功</div>
        )}
        
        <button
          onClick={handleSaveChanges}
          className="w-[300px] py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          保存更改
        </button>
      </div>
    </div>
  );
};

export default Settings;