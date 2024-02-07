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
  age: {
      type: Number,
      required: [true, 'Please provide age'],
  },
  style_of_music: {
      type: String,
      required: [true, 'Please provide style of music'],
  },
  gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Please provide gender'],
  },
  role: {
    type: String,
    enum: ['admin', 'business', 'client'],
    default: 'client',
  },
  password: {
    type: String,
    required: function() {
      return this.passwordRequired;
    },
    minlength: 6,
  },
  instagramId: {
    type: String,
    unique: true,
    sparse: true,
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true,
  },
  snapchatId: {
    type: String,
    unique: true,
    sparse: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  appleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  // Altri campi per gli ID dei social network
  passwordRequired: {
    type: Boolean,
    default: true,
  },
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.passwordRequired) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordRequired) {
    // Se la password non è richiesta, restituisci true
    return true;
  }
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);
