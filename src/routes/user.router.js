const { getAll, create, getOne, remove, update, login, getLoggedUser, verifyEmail } = require('../controllers/user.controller');
const express = require('express');
const verifyJWT = require('../utils/verifyJWT');

const userRouter = express.Router();

userRouter.route('/users')
    .get(verifyJWT, getAll)
    .post(create);

userRouter.route('/users/login')    
    .post(login)

userRouter.route('/users/me')    
    .get(verifyJWT, getLoggedUser)         

userRouter.route('/users/verify/:code')
    .get(verifyEmail)    

userRouter.route('/users/:id')
    .get(verifyJWT, getOne)
    .delete(verifyJWT, remove)
    .put(verifyJWT, update);

module.exports = userRouter;