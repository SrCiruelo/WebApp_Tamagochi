const mongoose         = require("mongoose");

mongoose.set('useCreateIndex', true);

const unique_validator = require("mongoose-unique-validator")

let Schema = mongoose.Schema;


let tamagochiPDU = new Schema({
    nombre:{
        type: String,
        required: true,
    },
    hambre:{
        type: Number,
        default: 100,
    },
    sueno: {
        type:Number,
        default: 50
    },
    limpieza: {
        type:Number,
        default: 10
    }
});


const non_unique_error = '{PATH} debe de ser único';
tamagochiPDU.plugin(unique_validator,{message: non_unique_error});
module.exports = mongoose.model("Tamagochi",tamagochiPDU);
