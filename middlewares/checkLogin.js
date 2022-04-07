const loggedIn= (req,res,next)=>{
    if (req.session && req.session.isAuth){
        return res.redirect('/tasks');
    }
    next();
}
module.exports=loggedIn