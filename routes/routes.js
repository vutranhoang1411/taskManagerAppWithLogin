const express = require('express');
const routes = express.Router();
const {getHomePage,getRegister,getLogin,userLogin,userRegister, getTasks,postTasks, getOneTask, postOneTask, deleteTask} = require('../controllers/controllers')
const authentication= require('../middlewares/authentication');
const checkLogin= require('../middlewares/checkLogin');
const validation = require('../validation/appValidation')

routes.get('/',getHomePage);

routes.route('/register').get(checkLogin,getRegister).post(validation(),userRegister);
routes.route('/login').get(checkLogin,getLogin).post(userLogin);
routes.route('/tasks').all(authentication).get(getTasks).post(postTasks);
routes.route('/tasks/:id').all(authentication).get(getOneTask).post(postOneTask).delete(deleteTask)
module.exports=routes;