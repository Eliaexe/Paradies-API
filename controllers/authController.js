const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');

const register = async (req, res) => {
  const { first_name, last_name, email, password, age, style_of_music, gender, role } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    res.status(400).json({ error: 'An account with this email already exists.' });
    return
  }

  if (!first_name || !last_name || !email || !password || !age || !style_of_music || !gender || !role) {
    res.status(400).json({ error: 'Please provide all required information.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Please provide a valid email address.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Please provide a password with at least 8 characters.' });
    return;
  }

  const parsedAge = Number(age);
  if (isNaN(parsedAge) || parsedAge < 18) {
    res.status(400).json({ error: 'You must be at least 18 years old to register.' });
    return;
  }

  if (!style_of_music || typeof style_of_music ==! String ) {
    res.status(400).json({ error: 'Please select a valid style of music.' });
    return;
  }

  const allowedGenders = ['male', 'female', 'other'];
  if (!allowedGenders.includes(gender)) {
      res.status(400).json({ error: 'Please select a valid gender.' });
      return;
  }

  const allowedRoles = ['admin', 'user'];
  if (!allowedRoles.includes(role)) {
      res.status(400).json({ error: 'Please select a valid role.' });
      return;
  }

  try {
    const user = await User.create({ first_name, last_name, email, password, age, style_of_music, role, gender });
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(201).json({ user: tokenUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }
  const user = await User.findOne({ email });

  if (!user) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid Credentials' });
    return
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid Credentials' });
    return
  }
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(0), 
    secure: true, 
    sameSite: 'None'
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};

module.exports = {
  register,
  login,
  logout,
};
