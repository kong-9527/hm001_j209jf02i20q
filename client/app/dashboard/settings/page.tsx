"use client";

import React, { useState } from 'react';

const Settings = () => {
  const [nickname, setNickname] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSaveChanges = () => {
    // 检查密码是否一致
    if (newPassword && newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      return;
    }
    
    // 密码一致，清除错误信息
    setPasswordError('');
    
    // 处理保存更改逻辑
    console.log({
      nickname,
      currentPassword,
      newPassword,
      confirmPassword
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-[800px]">
        <h1 className="text-2xl font-medium mb-6">Settings</h1>
        
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-bold font-medium mb-4">Profile</h2>
          
          <div className="grid grid-cols-[180px_1fr] gap-4 items-center mb-4">
            <label className="text-sm">Email</label>
            <div>
              <input
                type="email"
                value="fj2oifiq@fawf.ffff"
                disabled
                className="w-[300px] p-2 border rounded text-gray-500 bg-gray-50"
              />
              <span className="text-gray-400 text-sm ml-3">Cannot be changed</span>
            </div>
          </div>
          
          <div className="grid grid-cols-[180px_1fr] gap-4 items-center">
            <label className="text-sm">nickname</label>
            <div>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="please input your nickname"
                className="w-[300px] p-2 border rounded"
              />
              <span className="text-gray-400 text-sm ml-3">Up to 30 characters</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-bold font-medium mb-4">Change Password</h2>
          
          <div className="grid grid-cols-[180px_1fr] gap-4 items-center mb-4">
            <label className="text-sm">Current Password</label>
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
            <label className="text-sm">New Password</label>
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
            <label className="text-sm">Confirm New Password</label>
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
        
        <button
          onClick={handleSaveChanges}
          className="w-[300px] py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Save Change
        </button>
      </div>
    </div>
  );
};

export default Settings;