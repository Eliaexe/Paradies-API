const express = require('express');
// const passport = require('passport');
const router = express.Router();
// require('../config/passport-config')(passport);


const { register, login, logout } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

// const authType = ['instagram', 'google', 'snapchat', 'facebook', 'apple']

// authType.forEach(e => {
//     router.get(`/${e}`, passport.authenticate(e));
//     router.get(`/${e}/callback`,
//     passport.authenticate(e, { failureRedirect: '/login' }), (req, res) => {
//         res.status(StatusCodes.OK).json({ msg: 'Authenticated!' });    
//     }
//     );
// });

module.exports = router;
