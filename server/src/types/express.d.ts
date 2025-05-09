import User from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        nick_name?: string | null;
        register_type?: number | null;
        head_pic?: string | null;
        points?: string | null;
        google_id?: string | null;
        [key: string]: any;
      };
    }
  }
} 