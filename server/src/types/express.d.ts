import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email?: string;
        name?: string;
        [key: string]: any;
      };
    }
  }
} 