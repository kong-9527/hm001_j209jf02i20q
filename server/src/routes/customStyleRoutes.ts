import { Router } from 'express';
import { 
  createCustomStyle, 
  getUserCustomStyles, 
  getCustomStyleById, 
  updateCustomStyle, 
  deleteCustomStyle 
} from '../controllers/customStyleController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// 所有路由都需要JWT认证
router.use(authenticateJWT);

// 创建自定义风格
router.post('/', createCustomStyle);

// 获取当前用户的所有自定义风格
router.get('/', getUserCustomStyles);

// 根据ID获取自定义风格
router.get('/:id', getCustomStyleById);

// 更新自定义风格
router.put('/:id', updateCustomStyle);

// 删除自定义风格
router.delete('/:id', deleteCustomStyle);

export default router; 