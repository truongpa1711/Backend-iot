import express from 'express';
import { getAllData, getLatestData } from '../controllers/dataController.js';

const router = express.Router();

// Định nghĩa các route
router.get('/', getAllData);
router.get('/lastdata',getLatestData);


export default router;
