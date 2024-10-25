import mongoose from 'mongoose';

const dataSchema = new mongoose.Schema({
  temperature: String,
  humidity: String,
  brightness: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Data', dataSchema);
