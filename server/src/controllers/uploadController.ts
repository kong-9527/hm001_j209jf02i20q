import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

/**
 * 将Buffer转换为Readable流
 * @param buffer 文件缓冲区
 * @returns 可读流
 */
const bufferToStream = (buffer: Buffer): Readable => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

/**
 * 上传图片到Cloudinary
 * @param req 请求对象
 * @param res 响应对象
 */
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 获取当前用户ID（用于文件夹组织）
    const userId = (req.user as any)?.id || 'anonymous';
    
    // 创建上传流
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `garden-app/user-${userId}`,
        resource_type: 'image',
        transformation: [
          { quality: 'auto' }, // 自动优化质量
          { fetch_format: 'auto' } // 自动选择最佳格式
        ]
      },
      (error, result) => {
        if (error || !result) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Image upload failed' });
        }
        
        // 返回上传成功的图片URL
        return res.status(200).json({
          success: true,
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    // 将文件buffer转换为流并传输到Cloudinary
    bufferToStream(req.file.buffer).pipe(stream);
    
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'File upload failed' });
  }
}; 