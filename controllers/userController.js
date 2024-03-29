const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require('../utils');

const getAllUsers = async (req, res) => {
  // console.log(req.user);
  const users = await User.find({ role: 'user' }).select('-password');
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};
// update user with user.save()

const updateUser = async (req, res) => {
  const { first_name, last_name, email, age, style_of_music, _id } = req.body;

  // Verifica che i campi essenziali siano presenti
  if (!_id || !email || !first_name || !last_name) {
      throw new CustomError.BadRequestError('Please provide all values');
  }
  
  // Cerca l'utente nel database
  const user = await User.findOne({ _id }).select('-password');;

  // Verifica se l'utente esiste
  if (!user) {
      throw new CustomError.NotFoundError('User not found');
  }
  
  // Aggiorna l'oggetto user con i nuovi valori
  user.email = email;
  user.first_name = first_name;
  user.last_name = last_name;
  user.age = age;
  user.style_of_music = style_of_music;
  
  // Salva le modifiche nel database
  await user.save();

  // Crea il token dell'utente aggiornato
  const tokenUser = createTokenUser(user);

  // Allega i cookie alla risposta
  attachCookiesToResponse({ res, user: tokenUser });

  // Restituisci l'utente aggiornato nella risposta
  res.status(StatusCodes.OK).json({ user });
};


const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values');
  }
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};


