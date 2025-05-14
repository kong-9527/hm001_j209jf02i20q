import { Router, Request, Response, NextFunction } from 'express';
import passport from '../config/passport';
import { googleCallback, getCurrentUser, logout, refreshSession } from '../controllers/authController';

const router = Router();

// 检查是否配置了 Google 客户端 ID
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
console.log('AuthRoutes - Google Client ID 配置状态:', !!GOOGLE_CLIENT_ID);

// 定义扩展的 Request 接口以包含 isPopup 属性
interface ExtendedRequest extends Request {
  isPopup?: boolean;
}

// 添加一个测试路由，用于检查 auth 路由是否可访问
router.get('/test', (req: Request, res: Response) => {
  console.log('Auth test route accessed');
  res.status(200).json({ 
    message: 'Auth routes working',
    googleConfigured: !!GOOGLE_CLIENT_ID,
    env: process.env.NODE_ENV
  });
});

// 只有在配置了 Google 客户端 ID 时才启用 Google 登录路由
if (GOOGLE_CLIENT_ID) {
  console.log('启用 Google 认证路由');
  
  // Google 登录路由
  router.get(
    '/google',
    (req: ExtendedRequest, res: Response, next: NextFunction) => {
      console.log('Google 认证路由被访问, 查询参数:', req.query);
      
      // 处理弹窗模式
      const isPopup = req.query.popup === 'true';
      
      // 将弹窗状态保存到 request 对象中
      if (isPopup) {
        console.log('检测到弹窗模式');
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
      console.log('Google 回调路由被访问, 查询参数:', req.query);
      
      // 从state参数中获取popup状态
      let isPopup = false;
      try {
        if (req.query.state) {
          const state = JSON.parse(req.query.state as string);
          isPopup = state.popup === true;
          console.log('从 state 解析的 popup 状态:', isPopup);
        }
      } catch (error) {
        console.error('解析state参数失败:', error);
      }
      
      // 将弹窗状态添加到查询参数
      if (isPopup || req.query.popup === 'true' || req.isPopup === true) {
        req.query.popup = 'true';
        console.log('设置 popup 参数为 true');
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
  console.log('Google 认证未配置，使用替代路由');
  
  // 当未配置 Google 登录时，提供替代路由返回错误信息
  router.get('/google', (req: Request, res: Response) => {
    console.log('未配置的 Google 认证路由被访问');
    
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
    console.log('未配置的 Google 回调路由被访问');
    
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