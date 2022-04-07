const express = require('express');
const routes = require('./routes/routes');
const connectDB = require('./db/connectDB');
const session = require('express-session');
require('dotenv').config();
const app=express();
app.set('view engine', 'ejs');
app.use(express.static('./public'));
//middleware
app.use(express.urlencoded({extended:true}));
app.use(express.json())

//routes
app.use(session({
    secret:process.env.sessionKey,
    resave:false,
    saveUninitialized:false
}));
app.use('/',routes);


//error handle

const PORT = process.env.PORT || 3000;
const start = async()=>{
    try{
        await connectDB(process.env.MONGO_URI);
        app.listen(PORT,()=>{
            console.log(`server running at ${PORT}`);
        })
    }catch(error){
        console.log(error);
    }
}
start();

