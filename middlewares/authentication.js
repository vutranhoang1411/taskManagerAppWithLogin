const authorize = (req,res,next)=>{
    if (req.session && req.session.isAuth) {
        next();
    }
    else    res.render('./login/401')
}
module.exports=authorize;