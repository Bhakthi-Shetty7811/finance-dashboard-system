const svc = require('./dashboard.service');
const { success } = require('../../utils/response');

const summary        = async (req,res,next) => { try { const d=await svc.getSummary(req.user);        return success(res,d,'Summary fetched'); } catch(e){next(e);} };
const byCategory     = async (req,res,next) => { try { const d=await svc.getByCategory(req.user);     return success(res,d,'Category breakdown'); } catch(e){next(e);} };
const monthlyTrends  = async (req,res,next) => { try { const d=await svc.getMonthlyTrends(req.user);  return success(res,d,'Monthly trends'); } catch(e){next(e);} };
const recentActivity = async (req,res,next) => { try { const d=await svc.getRecentActivity(req.user); return success(res,d,'Recent activity'); } catch(e){next(e);} };

module.exports = { summary, byCategory, monthlyTrends, recentActivity };