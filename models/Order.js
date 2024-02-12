const mongoose = require('mongoose');

const SingleOrderItemSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
  },
});

const OrderSchema = mongoose.Schema(
  {
    total: {
      type: Number,
      required: true,
    },
    local: {
      type: mongoose.Schema.ObjectId,
      ref: 'Local',
      require: true,
    },
    orderItems: [SingleOrderItemSchema],
    status: {
      type: String,
      enum: ['canceled', 'failed', 'pending', 'paid', 'delivered'],
      default: 'pending',
      required: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    paymentIntentId: {
      type: String,
    },
    validationToken: {
      type: String,
    },
    qrCode: {
      type: String,
      required: true, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
