import mongoose from 'mongoose'

// Product photos uploaded from the admin panel are stored here (already resized by the browser, < 400 KB each),
// so no separate file-storage service is needed. Served by /api/product-image/[id].
const ProductImageSchema = new mongoose.Schema({
  data:        { type: Buffer, required: true },
  contentType: { type: String, enum: ['image/jpeg', 'image/png', 'image/webp'], required: true },
}, { timestamps: true })

export default mongoose.models.ProductImage || mongoose.model('ProductImage', ProductImageSchema)
