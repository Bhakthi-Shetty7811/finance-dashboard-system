const router = require('express').Router();
const ctrl   = require('./records.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const { validate, schemas }       = require('../../utils/validators');

router.use(authenticate);

// All roles can view
router.get('/',    validate(schemas.listRecords, 'query'), ctrl.list);
router.get('/:id', ctrl.getOne);

// Analyst + Admin can create
router.post('/', authorize('analyst','admin'), validate(schemas.createRecord), ctrl.create);

// Only Admin can update and delete
router.patch('/:id',  authorize('admin'), validate(schemas.updateRecord), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;