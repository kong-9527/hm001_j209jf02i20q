import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// 图片上传目录
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 生成唯一文件名
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // 写入文件
    fs.writeFileSync(filePath, req.file.buffer);

    // 构建文件URL
    const fileUrl = `/uploads/${fileName}`;

    return res.status(200).json({
      success: true,
      url: fileUrl,
      fileName: fileName
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'File upload failed' });
  }
}; 