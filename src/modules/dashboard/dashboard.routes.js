const router = require('express').Router();
const ctrl   = require('./dashboard.controller');
const { authenticate } = require('../../middleware/auth');

// All authenticated users can access dashboard
router.use(authenticate);

router.get('/summary',  ctrl.summary);
router.get('/category', ctrl.byCategory);
router.get('/trends',   ctrl.monthlyTrends);
router.get('/recent',   ctrl.recentActivity);

module.exports = router;