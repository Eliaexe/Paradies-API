const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  first_name: {
      type: String,
      required: [true, 'Please provide name'],
      minlength: 3,
      maxlength: 50,
  },
  last_name: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
      type: String,
      unique: true,
      required: [true, 'Please provide email'],
      validate: {
          validator: validator.isEmail,
          message: 'Please provide valid email',
      },
  },
  password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
  },
  age: {
      type: Number,
      required: [true, 'Please provide age'],
  },
  style_of_music: {
      type: String,
      required: [true, 'Please provide style of music'],
  },
  type_of_user: {
      type: String,
      enum: ['client', 'business'],
      default: 'client',
  },
  gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Please provide gender'],
  },
  role: {
    type: String,
    enum: ['admin', 'business', 'client'],
    default: 'user',
  },
});

UserSchema.pre('save', async function () {
  // console.log(this.modifiedPaths());
  // console.log(this.isModified('name'));
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);
