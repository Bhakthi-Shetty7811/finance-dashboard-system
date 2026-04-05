const router = require('express').Router();
const ctrl   = require('./auth.controller');
const { authenticate }  = require('../../middleware/auth');
const { validate, schemas } = require('../../utils/validators');

router.post('/register', validate(schemas.register), ctrl.register);
router.post('/login',    validate(schemas.login),    ctrl.login);
router.get('/me',        authenticate,               ctrl.getMe);

module.exports = router;