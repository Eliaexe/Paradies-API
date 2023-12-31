require('dotenv').config();
const Local = require('../models/Local')

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const getAllLocals = async (req, res) => {
    try {
        const locals = await Local.find({});
        const localsData = locals.map(local => local.toJSON());
        // console.log(JSON.parse(JSON.stringify(localsData)));  // Parse dopo stringify per evitare problemi di riferimenti circolari
        res.status(StatusCodes.OK).json({ localsData, count: localsData.length });
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Errore durante la ricerca dei locali.' });
    }
};

const getLocal = async (req, res) => {
    const { name: localName } = req.params;

    const local = Local.find({ name: localName })
    if (!local) {
        throw new CustomError.NotFoundError(`No local with the name ${local}`);
    }
    
    res.status(StatusCodes.OK).json({ local });
}

const getOwnerLocal = async (req, res) => {
    const { id } = req.params;

    try {
        const local = await Local.find({ owner: id });

        if (!local || local.length === 0) {
            throw new CustomError.NotFoundError(`No local with the owner ID ${id}`);
        }

        res.status(StatusCodes.OK).json({ local });
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Error fetching owner local' });
    }
};


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
    getOwnerLocal,
    createLocal,
    updateLocal, 
    deleteLocal
}