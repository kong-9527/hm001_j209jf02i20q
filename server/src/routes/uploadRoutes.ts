import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

// 配置内存存储
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制5MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!') as any, false);
    }
  }
});

// 上传图片路由
router.post('/image', authenticateJWT, upload.single('image'), uploadImage);

export default router; 