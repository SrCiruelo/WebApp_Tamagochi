
//Comenzamos nuestro rest server que recibirá los tres tipos de peticiones
const app      = require("./rest/rest.js").app;
const mongoose = require("mongoose");



//Se conecta a mongo db tiene que existir una base de datos Tamagochi con el campos de productos definidos
//Si no la función de compra no funcionará 
const options = {
  useNewUrlParser : true,
  useUnifiedTopology: true
}

mongoose.connect("mongodb://127.0.0.1:27017/Tamagochi",options,(err,res)=>{
    if(err)throw err;
    console.log("Conectado a la base de datos Tamagochi");
});