import express from 'express';
import cors from 'cors';
import mqttClient from './src/services/mqtt.js'; 
import dataRoutes from './src/routers/dataRoutes.js';
import devicesRouter from './src/routers/devicesRouter.js';
import connectDB from './src/config/db.js';

const app = express();
const PORT = process.env.PORT || 4040;

// Kết nối tới MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Sử dụng router
app.use('/api/data', dataRoutes);
app.use('/api/history', devicesRouter);

// Chạy server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
