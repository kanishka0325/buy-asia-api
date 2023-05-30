const { Schema, model } = require('mongoose');

const VariantSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

module.exports = model('variant', VariantSchema);
