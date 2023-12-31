const express = require('express')
const router = express.Router()

const {
    authenticateUser,
    authorizePermissions,
  } = require('../middleware/authentication');

const { getAllLocals, 
        getLocal, 
        createLocal,
        updateLocal, 
        deleteLocal
      } = require('../controllers/localsController.js')

router
    .route('/')
    .get(getAllLocals)
    .post([authenticateUser, authorizePermissions('business')], createLocal)
    .delete([authenticateUser, authorizePermissions('business')], deleteLocal)

router
    .route('/:id')
    .get(getLocal)
    .patch([authenticateUser, authorizePermissions('business')], updateLocal)

module.exports = router