import mongoose from 'mongoose';

const UserPropertySchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  type: { type: String, required: true },
  area: { type: Number, required: true },
  location: { type: String, required: true },
  amenities: [String],
  price: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.UserProperty || mongoose.model('UserProperty', UserPropertySchema, 'userProperties');
