require('dotenv').config();
const Local = require('../models/Local')

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const getAllLocals = async (req, res) => {
    const locals = Local.find({})
    res.status(StatusCodes.OK).json({locals, count: locals.length})
}

const getLocal = async (req, res) => {
    const { name: localName } = req.params;

    const local = Local.find({ name: localName })
    if (!local) {
        throw new CustomError.NotFoundError(`No local with the name ${local}`);
    }
    
    res.status(StatusCodes.OK).json({ local });
}

const createLocal = async (req, res) => {
    const local = await Local.create(req.body)
    res.status(StatusCodes.CREATED).json({ local })
}

const updateLocal = async (req, res) => {
    const { _id: localId } = req.params;

    const local = await Local.findOneAndUpdate({ _id: localId }, req.body, {
        new: true,
        runValidators: true,
    });

    if (!local) {
    throw new CustomError.NotFoundError(`No local with id : ${localId}`);
    }

    res.status(StatusCodes.OK).json({ local });
}

const deleteLocal = async (req, res) => {
    const { id: localId } = req.params;
  
    const local = await Local.findOne({ _id: localId });
  
    if (!local) {
      throw new CustomError.NotFoundError(`No local with id : ${localId}`);
    }
  
    await local.remove();
    res.status(StatusCodes.OK).json({ msg: 'Success! local removed.' });
};

module.exports = {
    getAllLocals, 
    getLocal, 
    createLocal,
    updateLocal, 
    deleteLocal
}