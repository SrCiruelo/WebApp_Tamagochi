const mongoose = require("mongoose");
const fs       = require("fs");
const csv_to_json = require("csvtojson");
const Usuario       = require("../Server/MongoosePDU/Identificacion/usuario");
const Producto      = require("../Server/MongoosePDU/producto/producto");
//Se conecta a mongo db tiene que existir una base de datos Tamagochi con el campos de productos definidos
//Si no la función de compra no funcionará
const options = {
  useNewUrlParser : true,
  useUnifiedTopology: true
}

var load_files = async () =>{
  let usuarios   = await csv_to_json().fromFile('Collections/Tamagochi.usuarios.csv');
  let productos  = await csv_to_json().fromFile('Collections/Tamagochi.productos.csv');
  usuarios.forEach((item, i) => {
    delete item.__v;
    if(item.tamagochis[0]._id==''){
      delete item.tamagochis;
    }
    item.compras.forEach((my_item, i) => {
      if(my_item=="")
      item.compras.splice(i,1);
    });
    let usuario = new Usuario(item);
    usuario.save((err,usuarioDB)=>{
      if(err){
        console.log("Es probable que la base de datos ya esté cargada");
      }
    });
  });
  productos.forEach((item, i) => {
    delete item.__v;
    item.image = item.image.substring(12,item.image.length-1);
    item.image = Buffer.from(item.image,"utf8");
    console.log(item.image);
    return;
    let producto = new Producto(item);
    producto.save((err,productoDB)=>{
      if(err){
        console.log("Es probable que la base de datos ya esté cargada");
      }
    })
  });

}

mongoose.connect("mongodb://127.0.0.1:27017/Tamagochi",options,async (err,res)=>{
    if(err)throw err;
    console.log("Conectado a la base de datos Tamagochi");
    await load_files();
    console.log("Collecciones cargadas");
});
