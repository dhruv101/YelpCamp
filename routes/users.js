const express = require('express');
const passport = require('passport');
const users = require('../controllers/users');
const router = express.Router();

//prettier-ignore
router.route('/register')
    .get(users.renderRegisterForm)
    .post(users.register);

//prettier-ignore
router.route('/login')
	.get(users.renderLoginForm)
	.post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/logout', users.logout);

module.exports = router;
