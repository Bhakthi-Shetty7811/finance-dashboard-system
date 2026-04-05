const service = require('./auth.service');
const { success, created, notFound } = require('../../utils/response');

const register = async (req, res, next) => {
  try {
    const data = await service.register(req.body);
    return created(res, data, 'Account created');
  } catch (e) { next(e); }
};

const login = async (req, res, next) => {
  try {
    const data = await service.login(req.body);
    return success(res, data, 'Login successful');
  } catch (e) { next(e); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await service.getMe(req.user.id);
    if (!user) return notFound(res);
    return success(res, { user });
  } catch (e) { next(e); }
};

module.exports = { register, login, getMe };