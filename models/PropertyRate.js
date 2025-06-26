// === models/PropertyRate.js ===
import mongoose from 'mongoose';

const PropertyRateSchema = new mongoose.Schema({
  city: { type: String, required: true },
  propertyType: { type: String, required: true },
  rate: { type: Number, required: true },
  amenities: { type: Object },
});

export default mongoose.models.PropertyRate || mongoose.model('PropertyRate', PropertyRateSchema);