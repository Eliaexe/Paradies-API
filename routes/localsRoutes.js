const express = require('express')
const router = express.Router()

const {
    authenticateUser,
    authorizePermissions,
  } = require('../middleware/authentication');

const { getAllLocals, 
        getLocal, 
        getOwnerLocal,
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

router
    .route('/owner/:id')
    .get(getOwnerLocal)
    .patch([authenticateUser, authorizePermissions('business')], updateLocal)

module.exports = router