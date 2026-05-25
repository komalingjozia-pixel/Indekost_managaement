import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response.js';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Token tidak ditemukan', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return sendError(res, 'Token tidak valid atau kedaluwarsa', 401);
  }
};

export default authMiddleware;
