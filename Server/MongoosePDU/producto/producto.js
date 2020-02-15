const mongoose         = require("mongoose");

mongoose.set('useCreateIndex', true);

const unique_validator = require("mongoose-unique-validator")

let Schema = mongoose.Schema;


let productoPDU = new Schema({
    image: {
        type: Buffer,
        contentType: String,
        required: [true,"Se requiere una imagen"]
    },
    image_type :{
        type: String,
        required: [true,"Se requiere espcificar el tipo de imagen"]
    },
    nombre:{
        type:String,
        required: [true,"Se requiere de una nombre"],
        unique:   true,
    },
    descripcion:{
        type:String,
        required: [true,"Se requiere de una descripción"]
    },
    recuperacion_hambre:{
        type:Number,
        required: [true,"Se requiere especificar recuperación"]
    },
    recuperacion_sueno:{
        type:Number,
        required: [true,"Se requiere especificar recuperación"]
    },
    recuperacion_limpieza:{
        type:Number,
        required: [true,"Se requiere especificar recuperación"]
    },

});


const non_unique_error = '{PATH} debe de ser único';
productoPDU.plugin(unique_validator,{message: non_unique_error});
module.exports = mongoose.model("Producto",productoPDU);
