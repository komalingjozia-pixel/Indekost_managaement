import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import authMiddleware from './middlewares/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import kamarRoutes from './routes/kamarRoutes.js';
import laporanRoutes from './routes/laporanRoutes.js';
import pembayaranRoutes from './routes/pembayaranRoutes.js';
import penghuniRoutes from './routes/penghuniRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'SIM Kost API berjalan' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/penghuni', authMiddleware, penghuniRoutes);
app.use('/api/kamar', authMiddleware, kamarRoutes);
app.use('/api/pembayaran', authMiddleware, pembayaranRoutes);
app.use('/api/laporan', authMiddleware, laporanRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan', data: null });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
