/**
 * 用户头像生成工具
 * 根据用户昵称首字母生成头像
 */

/**
 * 生成基于用户昵称首字母的头像URL
 * @param nickName 用户昵称
 * @returns 头像URL
 */
export const generateAvatarFromNickName = (nickName: string | null): string => {
  if (!nickName || nickName.trim() === '') {
    // 如果昵称为空，使用默认头像
    return 'https://ui-avatars.com/api/?name=U&background=random&color=fff';
  }
  
  // 获取昵称的首字母（支持中文和英文）
  const firstChar = nickName.trim().charAt(0).toUpperCase();
  
  // 使用UI Avatars服务生成头像
  // 参数说明:
  // - name: 显示的文字
  // - background: 背景颜色 (random为随机颜色)
  // - color: 文字颜色
  // - size: 图像大小
  // - rounded: 是否圆形
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstChar)}&background=random&color=fff&size=128&rounded=true`;
};

/**
 * 生成自定义颜色的头像URL
 * @param nickName 用户昵称
 * @param bgColor 背景颜色 (十六进制，不包含#)
 * @param textColor 文字颜色 (十六进制，不包含#)
 * @returns 头像URL
 */
export const generateCustomAvatar = (
  nickName: string | null, 
  bgColor: string = 'random', 
  textColor: string = 'ffffff'
): string => {
  if (!nickName || nickName.trim() === '') {
    return `https://ui-avatars.com/api/?name=U&background=${bgColor}&color=${textColor}`;
  }
  
  const firstChar = nickName.trim().charAt(0).toUpperCase();
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstChar)}&background=${bgColor}&color=${textColor}&size=128&rounded=true`;
}; 