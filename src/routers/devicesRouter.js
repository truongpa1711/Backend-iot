import express from 'express';
import { controlDevices, filterDevice } from '../controllers/devicesController.js';

const router = express.Router();

router.get("/filterDevice",filterDevice)
router.post("/controlDevices",controlDevices)

export default router;
