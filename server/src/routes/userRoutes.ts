import { Router } from 'express';
import { getAllUsers, getUserById, createUser } from '../controllers/userController';

const router = Router();

// 获取所有用户
router.get('/', getAllUsers);

// 根据ID获取用户
router.get('/:id', getUserById);

// 创建用户
router.post('/', createUser);

export default router; 