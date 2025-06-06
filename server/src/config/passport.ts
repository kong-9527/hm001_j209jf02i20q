// 确保环境变量已加载
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models';
import { generateAvatarFromNickName } from '../utils/avatarGenerator';
import { Op } from 'sequelize';

/**
 * Google OAuth 配置
 * 这些值应从环境变量中获取
 * 请确保在项目根目录下的 .env 文件中设置以下环境变量：
 * 
 * GOOGLE_CLIENT_ID=从Google Cloud Console获取的客户端ID
 * GOOGLE_CLIENT_SECRET=从Google Cloud Console获取的客户端密钥
 * GOOGLE_CALLBACK_URL=认证回调URL
 */
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

// 如果未设置客户端ID或密钥，在控制台显示警告
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('警告: Google OAuth 客户端ID或密钥未设置！请在 .env 文件中配置相应环境变量。');
  console.warn('Google 登录功能将不可用，但应用程序仍会继续运行。');
} else {
  // 只有在设置了有效的客户端ID和密钥时，才配置 Google 认证策略
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          // 获取Google ID和邮箱
          const googleId = profile.id;
          const email = profile.emails && profile.emails[0].value;
          
          if (!googleId) {
            return done(new Error('未能获取Google ID'), false);
          }
          
          if (!email) {
            return done(new Error('未能获取邮箱地址'), false);
          }

          // 优先通过google_id查找用户，其次使用email
          let user = await User.findOne({ 
            where: { 
              [Op.or]: [
                { google_id: googleId },
                { email: email }
              ]
            } 
          });

          if (user) {
            // 用户存在，但可能没有google_id（旧用户通过邮箱匹配）
            if (!user.google_id) {
              // 更新用户的google_id
              await user.update({ 
                google_id: googleId,
                register_type: 2 // 确保注册类型为Google
              });
            }
            return done(null, user);
          } else {
            // 创建新用户
            const now = Math.floor(Date.now() / 1000);
            const nickName = profile.displayName || email.split('@')[0]; // 优先使用Google显示名称
            
            // 根据昵称生成头像
            const avatarUrl = generateAvatarFromNickName(nickName);
            
            const newUser = await User.create({
              email,
              password: null, // Google 登录不需要密码
              register_type: 2, // 2表示Google登录
              nick_name: nickName,
              head_pic: avatarUrl, // 使用生成的头像URL
              points: "0",
              ctime: now,
              utime: now,
              google_id: googleId // 存储Google ID
            });
            
            return done(null, newUser);
          }
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
}

// 序列化用户
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// 反序列化用户
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport; 