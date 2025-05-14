import { Router, Request, Response, NextFunction } from 'express';
import passport from '../config/passport';
import { googleCallback, getCurrentUser, logout, refreshSession } from '../controllers/authController';

const router = Router();

// 检查是否配置了 Google 客户端 ID
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
console.log('Google Client ID是否设置:', !!GOOGLE_CLIENT_ID);
console.log('Google回调URL:', process.env.GOOGLE_CALLBACK_URL);

// 定义扩展的 Request 接口以包含 isPopup 属性
interface ExtendedRequest extends Request {
  isPopup?: boolean;
}

// 添加调试路由
router.get('/debug', (req, res) => {
  res.json({
    googleConfigured: !!GOOGLE_CLIENT_ID,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    clientUrl: process.env.CLIENT_URL,
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// 只有在配置了 Google 客户端 ID 时才启用 Google 登录路由
if (GOOGLE_CLIENT_ID) {
  // Google 登录路由
  router.get(
    '/google',
    (req: ExtendedRequest, res: Response, next: NextFunction) => {
      console.log('收到Google登录请求:', {
        query: req.query,
        headers: req.headers['user-agent'],
        referer: req.headers.referer
      });
      
      // 处理弹窗模式
      const isPopup = req.query.popup === 'true';
      
      // 将弹窗状态保存到 request 对象中
      if (isPopup) {
        req.isPopup = true;
        // 设置Google认证回调URL中的参数
        const authOptions = {
          scope: ['profile', 'email'],
          prompt: 'select_account', // 强制显示账户选择界面
          state: JSON.stringify({ popup: true }) // 通过state参数传递popup状态
        };
        return passport.authenticate('google', authOptions)(req, res, next);
      }
      
      next();
    },
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      prompt: 'select_account' // 强制显示账户选择界面
    })
  );

  // Google 回调路由
  router.get(
    '/google/callback',
    (req: ExtendedRequest, res: Response, next: NextFunction) => {
      console.log('收到Google回调请求:', {
        query: req.query,
        headers: req.headers['user-agent'],
        referer: req.headers.referer
      });
      
      // 从state参数中获取popup状态
      let isPopup = false;
      try {
        if (req.query.state) {
          const state = JSON.parse(req.query.state as string);
          isPopup = state.popup === true;
        }
      } catch (error) {
        console.error('解析state参数失败:', error);
      }
      
      // 将弹窗状态添加到查询参数
      if (isPopup || req.query.popup === 'true' || req.isPopup === true) {
        req.query.popup = 'true';
      }
      
      next();
    },
    passport.authenticate('google', { 
      failureRedirect: '/signin',
      session: false 
    }),
    googleCallback
  );
} else {
  // 当未配置 Google 登录时，提供替代路由返回错误信息
  router.get('/google', (req: Request, res: Response) => {
    console.log('收到Google登录请求，但未配置Google登录:', {
      query: req.query,
      headers: req.headers['user-agent'],
      referer: req.headers.referer
    });
    
    // 判断是否为弹窗模式
    const isPopup = req.query.popup === 'true';
    const clientUrl = process.env.CLIENT_URL;
    
    if (isPopup) {
      // 弹窗模式：返回错误消息
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Google 登录错误</title>
        </head>
        <body>
          <script>
            // 向父窗口发送登录失败消息
            if (window.opener) {
              window.opener.postMessage(
                { 
                  type: 'google-auth-error',
                  error: "Google 登录功能未配置，请联系管理员"
                }, 
                "${clientUrl}"
              );
              window.close();
            } else {
              // 如果没有父窗口，则重定向到登录页
              window.location.href = "${clientUrl}/signin?error=google_auth_not_configured";
            }
          </script>
          <div style="text-align: center; padding-top: 100px;">
            <h3>Google 登录未配置</h3>
            <p>正在关闭窗口...</p>
          </div>
        </body>
        </html>
      `;
      return res.send(html);
    } else {
      // 普通模式：返回 JSON 错误
      res.status(503).json({ 
        error: 'Google 登录功能未配置',
        message: '管理员需要在服务器配置 Google OAuth 凭据' 
      });
    }
  });
  
  router.get('/google/callback', (req: Request, res: Response) => {
    console.log('收到Google回调请求，但未配置Google登录:', {
      query: req.query,
      headers: req.headers['user-agent'],
      referer: req.headers.referer
    });
    
    const isPopup = req.query.popup === 'true';
    const clientUrl = process.env.CLIENT_URL;
    
    if (isPopup) {
      // 弹窗模式：返回错误消息
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Google 登录错误</title>
        </head>
        <body>
          <script>
            // 向父窗口发送登录失败消息
            if (window.opener) {
              window.opener.postMessage(
                { 
                  type: 'google-auth-error',
                  error: "Google 登录功能未配置，请联系管理员"
                }, 
                "${clientUrl}"
              );
              window.close();
            } else {
              // 如果没有父窗口，则重定向到登录页
              window.location.href = "${clientUrl}/signin?error=google_auth_not_configured";
            }
          </script>
          <div style="text-align: center; padding-top: 100px;">
            <h3>Google 登录未配置</h3>
            <p>正在关闭窗口...</p>
          </div>
        </body>
        </html>
      `;
      return res.send(html);
    } else {
      // 普通模式：重定向到登录页
      res.redirect('/signin?error=google_auth_not_configured');
    }
  });
}

// 获取当前登录用户
router.get('/me', getCurrentUser);

// 用户登出
router.get('/logout', logout);

// 刷新用户会话
router.post('/refresh-session', refreshSession);

export default router; 