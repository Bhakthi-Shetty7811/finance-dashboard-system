const svc = require('./records.service');
const { success, created, notFound } = require('../../utils/response');

const list   = async (req,res,next) => { try { const d=await svc.listRecords(req.query,req.user); return success(res,d.records,'Records fetched',200,d.pagination); } catch(e){next(e);} };
const getOne = async (req,res,next) => { try { const r=await svc.getRecordById(req.params.id,req.user); if(!r) return notFound(res,'Record not found'); return success(res,{record:r}); } catch(e){next(e);} };
const create = async (req,res,next) => { try { const r=await svc.createRecord(req.body,req.user.id); return created(res,{record:r},'Record created'); } catch(e){next(e);} };
const update = async (req,res,next) => { try { const r=await svc.updateRecord(req.params.id,req.body,req.user); return success(res,{record:r},'Record updated'); } catch(e){next(e);} };
const remove = async (req,res,next) => { try { await svc.deleteRecord(req.params.id,req.user); return success(res,null,'Record deleted'); } catch(e){next(e);} };

module.exports = { list, getOne, create, update, remove };