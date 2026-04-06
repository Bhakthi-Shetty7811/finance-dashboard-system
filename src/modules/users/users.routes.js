const router = require('express').Router();
const ctrl   = require('./users.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate, schemas }       = require('../../utils/validators');

router.use(authenticate);

router.get('/',              authorize('admin'), ctrl.listUsers);
router.get('/:id',           authorize('admin'), ctrl.getUserById);
router.patch('/:id/role',    authorize('admin'), validate(schemas.updateRole),   ctrl.updateRole);
router.patch('/:id/status',  authorize('admin'), validate(schemas.updateStatus), ctrl.updateStatus);
router.patch('/profile/me',                      validate(schemas.updateProfile), ctrl.updateProfile);
router.delete('/:id',        authorize('admin'), ctrl.deleteUser);

module.exports = router;