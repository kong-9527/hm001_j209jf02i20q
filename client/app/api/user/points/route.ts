import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/app/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET() {
  try {
    // 从cookie中获取token
    const cookieStore = cookies();
    const token = cookieStore.get('authToken')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { points: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ points: user.points });
  } catch (error) {
    console.error('Error fetching user points:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 