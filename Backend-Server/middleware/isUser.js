const isUser = (req, res, next) => {
    if(req.user && req.user.role === "user"){
        return next();
    }
    else{
        return res.status(403).json({message: "Only users can perform this action"});
    }
}

module.exports = isUser;
