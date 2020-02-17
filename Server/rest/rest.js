const body_parser   = require("body-parser");
const express       = require("express");
const underscore    = require("underscore")
const app           = express();
const port          = 3000;
const bcrypt        = require("bcrypt");
const jwt           = require("jsonwebtoken");
const Usuario       = require("../MongoosePDU/Identificacion/usuario");
const Producto      = require("../MongoosePDU/producto/producto");
const cookie_parser = require("cookie-parser");
const hbs           = require("hbs");
const path          = require("path");
const Tamagochi     = require("../MongoosePDU/tamagochi/tamagochi")
const {verificar_token,verificar_admin} = require("../My_Middleware/autenticacion");

//Esto es para la función de ayuda para crear productos
const fs            = require("fs");

app.set("view engine","hbs");

hbs.registerPartials(path.resolve(__dirname + "/../../views/partials/"));
hbs.registerHelper("toString",function(str){
    return "\""+str+"\"";
});
hbs.registerHelper("div",function(n0,div){
    return n0/div;
});
var productos = [];

Producto.find({},(err,results)=>{
    results.forEach(element => {
      let tmp_producto = {
          image_Path: "/imagenes/"+element.nombre,
          nombre    : element.nombre,
          descripcion: element.descripcion,
          recuperacion_hambre:   element.recuperacion_hambre,
          recuperacion_sueno:    element.recuperacion_sueno,
          recuperacion_limpieza: element.recuperacion_limpieza,
      }
      productos.push(tmp_producto);
    });

});



//Vencimiento del token 10 horas
process.env.CADUCIDAD_TOKEN = "10h";


if(process.env.SEED == undefined)
process.env.SEED = "este es mi token de desarrollo";

if(process.env.PORT != undefined)
    port = process.env.PORT;




//Body parser para separar el cuerpo de las peticiones post fácilmente
app.use(body_parser.urlencoded({extended:true}));
app.use(body_parser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(cookie_parser());


//Esta es una forma de enviar archivos .js con  la cabecera correcta
app.get("/web_serverAPI.js",(req,res)=>{
    res.header("Content-Type","application/javascript");
    res.sendFile(path.resolve(__dirname + "/../../views/web_serverAPI.js"));
});

app.get("/perfil_tamagochi/:nombre",verificar_token,(req,res)=>{
  let usuario = req.usuario;
  let nombre_tamagochi = req.params.nombre;
  if(!nombre_tamagochi){
    return res.status(400).json({
        ok:false,
        err: "No has espcificado ningún nombre"
    });
  }
  Usuario.findById(usuario._id,(err,UsuarioDB)=>{
      if(err){
          return res.status(400).json({
              ok:false,
              err
          });
      }
      else{
        if(UsuarioDB.tamagochis.length != 0){
          let tamagochi = UsuarioDB.tamagochis.find(element => element.nombre ==nombre_tamagochi);
          if(tamagochi){
            let mis_productos = UsuarioDB.compras;
            let real_productos = [];
            mis_productos.forEach((item, i) => {
              if(item!=''){
                Producto.findOne({nombre: item},(err,productoDB)=>{
                  if(err){
                    console.log(err);
                  }
                  let product_copy ={
                    nombre:                productoDB.nombre,
                    image_Path:            "../imagenes/"+productoDB.nombre,
                    descripcion:           productoDB.descripcion,
                    recuperacion_hambre:   productoDB.recuperacion_hambre,
                    recuperacion_sueno:    productoDB.recuperacion_sueno,
                    recuperacion_limpieza: productoDB.recuperacion_limpieza,
                  }
                  real_productos.push(product_copy);
                });
              }
            });
            res.render(path.resolve(__dirname + "/../../views/Common_user/perfil_tamagochi"),{tamagochi,productos:real_productos});
          }
          else{
            return res.status(400).json({
                ok:false,
                err: "No tienes ningún Tamagochi con ese nombre"
            });
          }
        }
        else{
          return res.status(400).json({
              ok:false,
              err: "No has creado ningún Tamagochi"
          });
        }

      }
  });
});

app.get("/common_user",verificar_token,(req,res)=>{
  let usuario = req.usuario;
  Usuario.findById(usuario._id,(err,UsuarioDB)=>{
      if(err){
          return res.status(400).json({
              ok:false,
              err
          });
      }
      else{
            res.render(path.resolve(__dirname + "/../../views/Common_user/tamagochi"),{tamagochis: UsuarioDB.tamagochis});
      }
  });
});
//Puede interesar cambiar el nombre del get y comprobar si el usuario es admin
app.get("/tienda",verificar_token,(req,res)=>{
    res.render(path.resolve(__dirname + "/../../views/Common_user/tienda"),{productos});
});
//Sin embargo con una ruta estática es suficiente


app.get('/',(req,res)=>{
    let my_path = path.resolve(__dirname + "/../../views/index.hbs");
    console.log(my_path);
    res.render(my_path);
});

app.post('/CreateNormalUser',(req,res)=>{
    let body = req.body;
    let usuario = new Usuario({
        id:   body.id,
        pass: bcrypt.hashSync(body.pass,10),
    });

    usuario.save((err,UsuarioDB)=>{
        if(err){

            return res.status(400).json({
                ok:false,
                err
            });
        }
        else{
            res.json({
                ok: true,
                user: UsuarioDB
            });
        }
    });
})

app.post('/CreateAdminUser',[verificar_token,verificar_admin],(req,res)=>{
    let body = req.body;
    let usuario = new Usuario({
        id:   body.id,
        pass: bcrypt.hashSync(body.pass,10),
        role: 'ADMIN_ROLE'
    });

    usuario.save((err,UsuarioDB)=>{
        if(err){

            return res.status(400).json({
                ok:false,
                err
            });
        }
        else{
            res.json({
                ok: true,
                user: UsuarioDB
            });
        }
    });
});

app.post('/login',(req,res)=>{
    console.log("Someone is triying to log in");
    if(req.cookies.token_cookie){
        res.cookie("token_cookie",null);
    }
    let body = req.body;
    let usuario = new Usuario({
        id:   body.id,
        pass: body.pass,
        role: body.role
    });
    Usuario.findOne({id: usuario.id},(err,UsuarioDB_log)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        if(UsuarioDB_log==null){
            return res.status(400).json({
                ok:false,
                err: "El Usuario no es correcto"
            });
        }
        if(!bcrypt.compareSync(usuario.pass,UsuarioDB_log.pass)){
            return res.status(400).json({
                ok:false,
                err: "Contraseña no es correcta"
            });
        }

        let token_cookie = req.cookies.token_cookie;
        if(!token_cookie || token_cookie=="")
        {
            let token = jwt.sign({
                usuario: UsuarioDB_log
            }, process.env.SEED,{expiresIn: process.env.CADUCIDAD_TOKEN});


            res.cookie('token_cookie',token);
        }
        res.status(200)
        .json({ok:true});
    });
});

app.post('/BoughtProducts',verificar_token,(req,res)=>{
    let usuario = req.usuario;
    Usuario.findById(usuario._id,(err,UsuarioDB)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        else{
            return res.status(200).json({
                ok: true,
                compras: UsuarioDB.compras
            })
        }
    });
})

app.post('/Buy',verificar_token,(req,res)=>{
    let usuario = req.usuario;
    let nombre_producto = req.body.nombre;
    if(req.body.nombre==undefined){
        return res.status(400).json({
            ok:false,
            err: "Se necesita especificar un nombre"
        });
    }
    let found_product = productos.find(element=> element.nombre == nombre_producto);
    if(found_product){
        Usuario.findById(usuario._id,(err,UsuarioDB)=>{
            if(err){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }
            console.log(UsuarioDB.compras);
            let already_bought = UsuarioDB.compras.find(element => element == found_product.nombre);
            if(already_bought){
                return res.status(400).json({
                    ok:false,
                    err: "Ya ha sido comprado"
                });
            }
            UsuarioDB.compras.push(found_product.nombre);
            UsuarioDB.save((err,usuario_final)=>{
                if(err){
                    return res.status(400).json({
                        ok:false,
                        err
                    });
                }
                else{
                    console.log(`I should have bought ${nombre_producto} is already bought by ${usuario.id}`);
                    return res.status(200).json({
                        ok:true,
                        usuario_final
                    });
                }
            });
        });
    }
    else{
        return res.status(400).json({
            ok:false,
            err: "No existe ese producto"
        });
    }
});


app.delete('/usuario/:id', [verificar_token, verificar_admin], function(req, res) {


    let id = req.params.id;

    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    let cambiaEstado = {
        estado: false
    };

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    });



});

app.get('/imagenes/:nombre',(req,res)=>{
    Producto.findOne({nombre: req.params.nombre},(err,productoDB)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        if(productoDB==null){
            return res.status(400).json({
                ok:false,
                err: "El Nombre no es correcto"
            });
        }
        res.contentType(productoDB.image_type);
        console.log(productoDB.image);
        res.send(productoDB.image);
    });
});


//Esto es una función de ayuda no estaría en una versión final del producto
app.post('/CreateProducto',(req,res)=>{
    let body = req.body;
    let my_producto = new Producto({
        image:    fs.readFileSync(body.image_Path),
        image_type: body.image_type,
        nombre:   body.nombre,
        descripcion: body.descripcion,
        recuperacion_hambre: body.recuperacion_hambre,
        recuperacion_sueno : body.recuperacion_sueno,
        recuperacion_limpieza: body.recuperacion_limpieza
    });
    my_producto.save((err,productoDB)=>{
        if(err){
            console.log(my_producto.image.data);
            return res.status(400).json({
                ok:false,
                err
            });
        }
        else{
            res.json({
                ok: true,
                user: productoDB
            });
        }

    });
});

app.post('/TamagochiUsarItem',verificar_token,(req,res)=>{
    let usuario = req.usuario;
    let nombre_producto  = req.body.nombre_producto;
    let nombre_tamagochi = req.body.nombre_tamagochi;
    if(req.body.nombre_producto==undefined){
        return res.status(400).json({
            ok:false,
            err: "Se necesita especificar un nombre"
        });
    }
    Usuario.findById(usuario._id,(err,UsuarioDB)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }
        let found_product_index = UsuarioDB.compras.findIndex(element => element == nombre_producto);
        if(found_product_index == -1){
            return res.status(400).json({
                ok:false,
                err: `El Usuario ${usuario.id} no tiene el producto ${nombre_producto}`
            });
        }
        let found_product       = productos.find(element => element.nombre == nombre_producto);
        let tamagochi_index = UsuarioDB.tamagochis.findIndex(element => element.nombre == nombre_tamagochi);
        if(tamagochi_index == -1){
            return res.status(400).json({
                ok:false,
                err: "Tamagochi no existe"
            });
        }
        UsuarioDB.tamagochis[tamagochi_index].hambre   += found_product.recuperacion_hambre;
        UsuarioDB.tamagochis[tamagochi_index].sueno    += found_product.recuperacion_sueno;
        UsuarioDB.tamagochis[tamagochi_index].limpieza += found_product.recuperacion_limpieza;
        UsuarioDB.compras.splice(found_product_index,1);
        UsuarioDB.save((err,usuario_final)=>{
            if(err){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }
            else{
                console.log(`I should have added ${nombre_tamagochi} to tamagochi ${usuario.id}`);
                return res.status(200).json({
                    ok:true,
                    tamagochi: usuario_final.tamagochis[tamagochi_index]
                });
            }
        });
    });
});

app.post('/TamagochiCreate',verificar_token,(req,res)=>{
    let usuario = req.usuario;
    let nombre  = req.body.nombre;

    Usuario.findById(usuario._id,(err,UsuarioDB)=>{
        if(UsuarioDB.tamagochis.find(element => element.nombre == nombre)){
            return res.status(400).json({
                ok:false,
                err: "Nombre del tamagochi debe ser único"
            });
        }
        let my_tamagochi = new Tamagochi({
            nombre
        });
        UsuarioDB.tamagochis.push(my_tamagochi);
        UsuarioDB.save((err,usuario_final)=>{
            if(err){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }
            else{
                console.log(`I should have created ${nombre}`);
                return res.status(200).json({
                    ok:true,
                    usuario_final
                });
            }
        });
    });
});
//Hay que crear productos con los nuevos stats y ya no queda casi nada
app.listen(port,()=>{
    console.log(`Listening at port:: ${port}`);
})

module.exports.app = app;
