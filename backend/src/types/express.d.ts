import { AuthContextUser } from './auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthContextUser;
      id?: string;
    }
  }
}

export {};
