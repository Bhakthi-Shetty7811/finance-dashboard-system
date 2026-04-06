const svc = require('./users.service');
const { success, notFound } = require('../../utils/response');

const listUsers    = async (req,res,next) => { try { const d=await svc.listUsers(+req.query.page||1, +req.query.limit||20); return success(res,d.users,'Users fetched',200,d.pagination); } catch(e){next(e);} };
const getUserById  = async (req,res,next) => { try { const u=await svc.getUserById(req.params.id); if(!u) return notFound(res); return success(res,{user:u}); } catch(e){next(e);} };
const updateRole   = async (req,res,next) => { try { const u=await svc.updateRole(req.params.id,req.body.role,req.user.id); return success(res,{user:u},'Role updated'); } catch(e){next(e);} };
const updateStatus = async (req,res,next) => { try { const u=await svc.updateStatus(req.params.id,req.body.status,req.user.id); return success(res,{user:u},'Status updated'); } catch(e){next(e);} };
const updateProfile= async (req,res,next) => { try { const u=await svc.updateProfile(req.user.id,req.body.name); return success(res,{user:u},'Profile updated'); } catch(e){next(e);} };
const deleteUser   = async (req,res,next) => { try { await svc.deleteUser(req.params.id,req.user.id); return success(res,null,'User deleted'); } catch(e){next(e);} };

module.exports = { listUsers, getUserById, updateRole, updateStatus, updateProfile, deleteUser };