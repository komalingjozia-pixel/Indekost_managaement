import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';
import { sendError, sendSuccess } from '../utils/response.js';
import { validateLogin } from '../utils/validators.js';

export const login = async (req, res) => {
  try {
    const validation = validateLogin(req.body);
    if (!validation.valid) return sendError(res, validation.message);

    const { username, password } = req.body;

    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('username', username.trim())
      .single();

    if (error || !admin) {
      return sendError(res, 'Username atau password salah', 401);
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return sendError(res, 'Username atau password salah', 401);
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, nama_admin: admin.nama_admin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return sendSuccess(res, {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        nama_admin: admin.nama_admin,
      },
    }, 'Login berhasil');
  } catch (err) {
    console.error('login error:', err);
    return sendError(res, 'Gagal login', 500);
  }
};
