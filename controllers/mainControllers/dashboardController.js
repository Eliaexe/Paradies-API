const Local = require('../../models/Local');
const User = require('../../models/User');
const Order = require('../../models/Order');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../../errors');
const { checkPermissions } = require('../../utils');

const getAllBusinessInformation = async (req, res) => {
  try {
    if (!req.params.id) {
      throw new CustomError.BadRequestError('Missing owner ID parameter');
    }

    const user = await User.findOne({ _id: req.params.id }).select('-password');

    if (!user) {
      throw new CustomError.NotFoundError(`No user with ID ${req.params.id}`);
    }

    const { local, orders } = await getBusinessData(user.role, req.user, req.params.id);

    const responseObj = {
      local,
      user,
      orders,
    };

    res.status(StatusCodes.OK).json(responseObj);
  } catch (error) {
    console.error(error);

    const status = error.constructor === CustomError ? error.statusCode : StatusCodes.INTERNAL_SERVER_ERROR;
    res.status(status).json({ error: error.message });
  }
};

// Function to fetch data based on role
const getBusinessData = async (role, reqUser, ownerId) => {
  let local, orders;

  switch (role) {
    case 'client':
      const locals = await Local.find({});
      local = locals.map(local => local.toJSON());
      orders = await Order.find({ user: reqUser.userId });
      break;
    case 'business':
      local = await Local.findOne({ owner: ownerId });
      if (!local) {
        throw new CustomError.NotFoundError(`No local with owner ID ${ownerId}`);
      }
      checkPermissions(reqUser, local.owner);
      orders = await Order.find({ local: local._id });
      break;
    default:
      throw new CustomError.BadRequestError(`Invalid role: ${role}`);
  }

  return { local, orders };
};

module.exports = {
  getAllBusinessInformation
};
