import axios from 'axios';
import cloudinary from '../config/cloudinary';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import os from 'os';
import { randomUUID } from 'crypto';

/**
 * 从外部URL下载图片并上传到Cloudinary
 * @param imageUrl 外部图片URL
 * @param userId 用户ID (用于Cloudinary文件夹组织)
 * @returns Cloudinary图片URL
 */
export async function downloadAndUploadToCloudinary(imageUrl: string, userId: number): Promise<string> {
  let tempFilePath = '';
  
  try {
    console.log(`开始处理图片: ${imageUrl}`);
    
    // 使用系统临时目录存储临时文件
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `temp_${randomUUID()}.jpg`);
    
    // 创建可写入流
    const writer = fs.createWriteStream(tempFilePath);
    
    // 使用axios下载图片
    const response = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'stream',
      timeout: 60000, // 60秒超时
    });
    
    // 使用pipeline保存图片到临时文件
    await pipeline(response.data, writer);
    
    console.log(`图片已下载到临时文件: ${tempFilePath}`);
    
    // 上传到Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        tempFilePath,
        {
          folder: `garden-app/user-${userId}/designs`,
          resource_type: 'image',
          transformation: [
            { quality: 'auto' }, // 自动优化质量
            { fetch_format: 'auto' } // 自动选择最佳格式
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
    
    console.log(`图片已上传到Cloudinary: ${result.secure_url}`);
    
    // 确保获取到URL后再清理临时文件
    if (result && result.secure_url) {
      // 使用promises版本的unlink以便可以等待清理完成
      try {
        await fs.promises.unlink(tempFilePath);
        console.log(`临时文件已成功清理: ${tempFilePath}`);
      } catch (unlinkError) {
        // 只记录错误但不中断流程，因为我们已经有了Cloudinary URL
        console.error(`清理临时文件失败: ${unlinkError}`);
        console.log(`注意: 临时文件 ${tempFilePath} 未被清理，但不影响功能`);
      }
      
      return result.secure_url;
    } else {
      throw new Error('未能从Cloudinary获取到有效的URL');
    }
  } catch (error) {
    console.error('下载并上传图片到Cloudinary时出错:', error);
    
    // 如果临时文件存在但处理失败，尝试清理
    if (tempFilePath) {
      try {
        // 检查文件是否存在
        if (fs.existsSync(tempFilePath)) {
          await fs.promises.unlink(tempFilePath);
          console.log(`出错后清理临时文件成功: ${tempFilePath}`);
        }
      } catch (cleanupError) {
        console.error(`出错后清理临时文件失败: ${cleanupError}`);
      }
    }
    
    // 出错时直接返回原始URL，确保不会因此阻断流程
    return imageUrl;
  }
}