const { Schema, model } = require('mongoose');

const MessageSchema = new Schema({
  title: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
    trim: true,
    required: true,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'customer',
    required: true,
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'seller',
    required: true,
  },
  author: {
    type: Schema.Types.Mixed,
    required: true,
  },
  read: {
    type: Boolean,
    required: true,
  },
}, { timestamps: true });

module.exports = model('message', MessageSchema);
