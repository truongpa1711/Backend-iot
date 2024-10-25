import mongoose from 'mongoose';

const devicesSchema = new mongoose.Schema({
  fan: { type: String, enum: ['1', '0', ""] },
  ac: { type: String, enum: ['1', '0', ""] },
  light: { type: String, enum: ['1', '0', ""] },
  timestamp: { type: Date, default: Date.now }
});

const Devices = mongoose.model('Devices', devicesSchema);

export default Devices;
