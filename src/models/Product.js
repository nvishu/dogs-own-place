import mongoose from 'mongoose'

const VariantSchema = new mongoose.Schema({
  size:  { type: String, required: true, trim: true, maxlength: 60 },
  price: { type: Number, required: true, min: 1, max: 1000000 },
  mrp:   { type: Number, required: true, min: 1, max: 1000000 },
  stock: { type: Number, required: true, min: 0, default: 0 },
}, { _id: false })

const ProductSchema = new mongoose.Schema({
  slug:        { type: String, required: true, unique: true, index: true },
  name:        { type: String, required: true, trim: true, maxlength: 160 },
  brand:       { type: String, required: true, trim: true, maxlength: 80 },
  category:    { type: String, enum: ['dog', 'cat'], required: true, index: true },
  type:        { type: String, required: true, trim: true, maxlength: 40 },
  tagline:     { type: String, default: '', maxlength: 200 },
  description: { type: String, default: '', maxlength: 3000 },
  highlights:  { type: [String], default: [] },
  suitableFor: { type: String, default: '', maxlength: 200 },
  feeding:     { type: String, default: '', maxlength: 1500 },
  image:       { type: String, default: '' },
  variants:    { type: [VariantSchema], validate: (v) => v.length >= 1 && v.length <= 8 },
  active:      { type: Boolean, default: true, index: true },
}, { timestamps: true })

export default mongoose.models.Product || mongoose.model('Product', ProductSchema)
