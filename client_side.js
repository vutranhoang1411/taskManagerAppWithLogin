//Dependencies
const express= require("express")
const bodyParser= require("body-parser")
const axios=require('axios');
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
const session=require('express-session');
const userValidation=require('./validation/appValidation.js')
const {validationResult}=require('express-validator');
//App init

const app=express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret:"A very long long long string",
    resave:false,
    saveUninitialized:false
}));


//Serving page
app.get('/',loggedIn,(req,res)=>{
    res.render('home');
})
app.get('/register',loggedIn,(req,res)=>{
    res.render('register');
})
app.get('/login',loggedIn,(req,res)=>{
    res.render('login');
})
app.get('/logout',(req,res,next)=>{
    if (req.session.isAuth){
        req.session.destroy((err)=>{
            if (err)    throw err;
            next();
        })
    }
    else next();
},(req,res)=>{
    res.redirect('/');
})
function loggedIn(req,res,next){
    if (req.session.isAuth){
        res.redirect('/secrets');
    }
    else{
        next();
    }
}
app.get('/submit',authorize,(req,res)=>{
    res.render('submit');
})
app.get('/secrets',authorize,(req,res)=>{
    axios.get('http://localhost:5000/secrets').then((response)=>{
        if (response.data.acknowledge===true){
            res.render('secrets',{secrets:response.data.result});
        }
        else{
            //do something;
        }
    })
})
app.post('/submit',authorize,(req,res)=>{
    axios.patch(`http://localhost:5000/submit/${req.session.username}`,{
        story:req.body.secret
    }).then((response)=>{
        if (response.acknowledge===true){
            console.log(`User ${req.sessionID} just successfully submit a secret`);
            req.redirect('/secrets');
        }
        else{
            // handle
            res.redirect('/secrets');
        }
    })//handle error
})
function authorize(req,res,next){
    if (req.session.isAuth) {
        next();
    }
    else{
        res.render('401');
    }
}

// app.get('/logout',(req,res)=>{
//     if (req.cookies.login==='true')    res.cookie('login','deleted');
//     res.redirect('/login');
// })
// app.get('/submit',(req,res)=>{
//     if (req.session.login==='true')   res.render('submit');
//     else res.redirect('/login');
// })
//Handle post
app.post('/register',userValidation(),(req,res)=>{
    const validationError=validationResult(req);
    const {username,password,passwordConfirm}=req.body;
    if (!validationError.isEmpty()){
        return res.render('register',{email:username,password:password,passwordConfirm:passwordConfirm,validationErrors:validationError.mapped()});
    }
    let m_param=(({username})=>({username}))(req.body);
    axios.get('http://localhost:5000/login',{params:m_param}).then((response1)=>{
        if (response1.data.acknowledge===true){ //already exist
            const conflictError="The email is already exist!";
            res.render('register',{email:username,password:password,passwordConfirm:passwordConfirm,conflictError:conflictError});
        }
        else{
            bcrypt.hash(req.body.password,10).then((result)=>{
                req.body.password=result;
                axios.post('http://localhost:5000/register',req.body).then((response2)=>{
                    console.log(response2.data);
                    res.redirect('/login');
                })
            })
        }
    })
})

app.post('/login',(req,res)=>{
    const {username,password}=req.body;
    const loginError="Wrong email or user password";
    let m_param=(({username})=>({username}))(req.body);
    axios.get('http://localhost:5000/login',{params:m_param})
    .then((response)=>{
        // if (response.status===404){
        //     res.redirect('/register');
        // }
        if (response.data.acknowledge===true){
            bcrypt.compare(req.body.password,response.data.password).then((result)=>{
                if (result){
                    req.session.isAuth=true;
                    req.session.username=username;
                    console.log(`session with id ${req.sessionID} have been created`);
                    res.redirect('/secrets');
                }
                else{
                    res.render('login',{username:username,password:password,loginError:loginError});
                }
            })
        }
        else{
            res.render('login',{username:username,password:password,loginError:loginError});
        }
    })
    // .catch((error)=>{
    //     console.log(error);
    //     res.redirect('/login');
    // })
})



app.listen(3000,()=>{
    console.log("Listening on port 3000!");
})