module.exports = function jwtAuth(req, res, next) {
    if(req.cookies && req.cookies.user){
        console.log("JWT ENTERED");
        next();
    }
    else{
        console.log("REDIRECTION");;
        res.redirect('/login');
    }
}