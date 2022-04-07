
const {validationResult}=require('express-validator');
const userModel = require('../model/userData');
const bcrypt= require('bcrypt');

const session=require('express-session');
const { default: mongoose } = require('mongoose');

const getHomePage = (req,res,next)=>{
    res.render('./login/home');
}
const getRegister = (req,res,next)=>{
    res.render('./login/register');
}
const getLogin = (req,res,next)=>{
    res.render('./login/login');
}
const userRegister=async (req,res,next)=>{
    try{
        const validationError=validationResult(req);
        const {username,password,passwordConfirm}=req.body;

        ////////////////validate user input
        if (!validationError.isEmpty()){
            return res.render('./login/register',{email:username,password:password,passwordConfirm:passwordConfirm,validationErrors:validationError.mapped()});
        }
        ////////////////////


        //////////////////////check if user is exist
        
        const data = await userModel.find({username:username}); //might have error
        if (data.length>0){//user already exist
            const conflictError="The email is already exist!";
            return res.render('./login/register',{email:username,password:password,passwordConfirm:passwordConfirm,conflictError:conflictError});
        }
        //////////////////////
    
        /////////////////////encode password and save user data
        const encodedPassword = await bcrypt.hash(password,10);// might have error
        await userModel.create({username:username,password:encodedPassword});
        res.redirect('/login');
        ////////////////////

        
    }catch(error){
        console.log(error);
        ///handle error
    }
}
const userLogin=async (req,res,next)=>{
    try{
        const {username,password}=req.body;

        const loginError="Wrong email or user password";
    
        /////////////////////////check username and password
        const data = await userModel.findOne({username:username});
        const compareResult = await bcrypt.compare(password,data.password)
    
        if (!compareResult){ //wrong password
            res.render('./login/login',{username:username,password:password,loginError:loginError})
        }
        /////////////////success
        else{
            req.session.isAuth=true;
            req.session.username=username;
            res.redirect('/tasks') 
        }
        //create session
        
    }catch(error){
        console.log(error);
    }
}
const getTasks = async(req,res,next)=>{
    try{
        const username=req.session.username;
        const data = await userModel.findOne({username:username});
        res.render('./mainPage/index',{tasks:data.task});        
    }catch(error){
        console.log(error);
    }

}
const postTasks = async (req,res,next)=>{
    try{
        const {username} = req.session;
        const taskName=req.body.name;
        const updatedTask={
            taskName:taskName
        }
        await userModel.updateOne({username:username},{
            $push:{task:updatedTask}
        });
        res.redirect('/tasks');
    }catch(erorr){
        console.log(erorr);
    }
} 
const getOneTask = async(req,res,next)=>{
    try{
        const {username}=req.session;
        const taskID= req.params.id;
        const user = await userModel.findOne({username:username});
        const queriedTask= user.task.find(element=>element._id.toString()===taskID);
        console.log(queriedTask);
        res.render('./mainPage/task',{element:queriedTask});
        
    }catch(error){
        console.log(error);
    }
}
const postOneTask = async (req,res,next)=>{
    try{
        const {username}=req.session;
        let {name,completed}=req.body;
        if (completed){
            completed=true;
        }else{
            completed=false;
        }
        const taskID = req.params.id;
        await userModel.updateOne(
            {username:username,'task._id':taskID},
            {
                '$set':{
                    'task.$.taskName':name,
                    'task.$.completed':completed
                }
            }
        )
        res.redirect(`/tasks/${taskID}`)
    }catch(error){
        console.log(error);
    }
}
const deleteTask = async(req,res,next)=>{
    
}
module.exports={getHomePage,getRegister,getLogin,userRegister,userLogin,getTasks,postTasks,getOneTask,postOneTask};