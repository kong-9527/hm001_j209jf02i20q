import { Router } from 'express';
import passport from '../config/passport';
import { googleCallback, getCurrentUser, logout } from '../controllers/authController';

const router = Router();

// 检查是否配置了 Google 客户端 ID
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

// 只有在配置了 Google 客户端 ID 时才启用 Google 登录路由
if (GOOGLE_CLIENT_ID) {
  // Google 登录路由
  router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  // Google 回调路由
  router.get(
    '/google/callback',
    passport.authenticate('google', { 
      failureRedirect: '/signin',
      session: false 
    }),
    googleCallback
  );
} else {
  // 当未配置 Google 登录时，提供替代路由返回错误信息
  router.get('/google', (req, res) => {
    res.status(503).json({ 
      error: 'Google 登录功能未配置',
      message: '管理员需要在服务器配置 Google OAuth 凭据' 
    });
  });
  
  router.get('/google/callback', (req, res) => {
    res.redirect('/signin?error=google_auth_not_configured');
  });
}

// 获取当前登录用户
router.get('/me', getCurrentUser);

// 用户登出
router.get('/logout', logout);

export default router; 