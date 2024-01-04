const mongoose = require('mongoose')
const ProductSchema = require('./Product.js');

const LocalSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        trim: true,
        required: [true, 'Please provide local name'],
        maxlength: [100, 'Name can not be more than 100 characters'],
      },
      description: {
        type: String,
        required: [true, 'Please provide local description'],
        maxlength: [1000, 'Description can not be more than 1000 characters'],
      },
      location: {
        type: String,
        required: [true, 'Please provide local location'],
        maxlength: [1000, 'Location can not be more than 1000 characters'],
      },
      image: {
        type: String,
        default: '/uploads/example.jpeg',
      },
      inventory: [
        {
          name: {
            type: String,
            trim: true,
            required: [true, 'Please provide product name'],
            maxlength: [100, 'Name can not be more than 100 characters'],
          },
          price: {
            type: Number,
            required: [true, 'Please provide product price'],
            default: 0,
          },
          description: {
            type: String,
            required: [true, 'Please provide product description'],
            maxlength: [1000, 'Description can not be more than 1000 characters'],
          },
          image: {
            type: String,
            default: '/uploads/example.jpeg',
          },
          category: {
            type: String,
            required: [true, 'Please provide product category'],
          },
          quantity: {
            type: Number,
            required: true,
            default: 15,
          },
          id: {
            type: mongoose.ObjectId,
            required: true,
          },
        },
      ],
      owner: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
  );
  
  LocalSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'local',
    justOne: false,
  });
  
  LocalSchema.pre('remove', async function (next) {
    await this.model('Review').deleteMany({ local: this._id });
  });
  
  module.exports = mongoose.model('Local', LocalSchema);
  