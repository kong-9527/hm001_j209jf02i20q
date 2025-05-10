import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUserProfile } from '../controllers/userController';

const router = Router();

// 获取所有用户
router.get('/', getAllUsers);

// 根据ID获取用户
router.get('/:id', getUserById);

// 创建用户
router.post('/', createUser);

// 更新用户个人资料
router.put('/profile', updateUserProfile);

export default router; 