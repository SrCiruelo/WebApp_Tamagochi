const jwt = require("jsonwebtoken");

let verificar_token = (req,res,next)=>{
    let token = req.cookies.token_cookie;
    if(!token){
        return res.status(401).json({
            ok:false,
            err:"Couldn't access requested cookie"
        });
    }
    jwt.verify(token,process.env.SEED,(err,decoded)=>{
        
        if(err){
            res.cookie("token_cookie","");
            return res.status(401).json({
                ok:false,
                err 
            });
        }
        req.usuario = decoded.usuario;
        next();
    });

};

let verificar_admin = (req,res,next)=>{
    let usuario = req.usuario;

    if(usuario.role == 'ADMIN_ROLE'){
        next();
    }
    else{
        return res.status(401).json({
            ok:false,
            err: "El usuario no es admin"
        });
    }

};

module.exports = {verificar_token,verificar_admin};