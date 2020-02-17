const mongoose         = require("mongoose");
const Tamagochi        = require("../tamagochi/tamagochi")
mongoose.set('useCreateIndex', true);

const unique_validator = require("mongoose-unique-validator")

let Schema = mongoose.Schema;
let roles_validos = {
    values: ['ADMIN_ROLE','USER_ROLE'],
    message: '{VALUE} no es un rol válido'
}

//Aquí definimos la pdu del usuario
//Dado la pdu depende de a que ruta mandemos la PDU y no del tipo
//El tipo ya no es un atributo necesario
//se ha añadido un rol para poder logear como admin

let usuarioPDU = new Schema({
    id:{
        type:String,
        required: [true,"Se requiere de una id"],
        unique:   true,
    },
    pass:{
        type:String,
        required: [true,"Se requiere de un pass"]
    },
    role:{
        type:String,
        default: 'USER_ROLE',
        required: false,
        enum: roles_validos
    },
    estado:{
        type: Boolean,
        default: true,
    },
    compras:{
      //Añadir referencia
        type: [String],
    },
    tamagochis:{
        type: [Tamagochi.schema],
    }
});


usuarioPDU.methods.toJSON = function(){
    let user = this;
    let userObject = user.toObject();

    delete userObject.pass;
    return userObject;
}

const non_unique_error = '{PATH} debe de ser único';
usuarioPDU.plugin(unique_validator,{message: non_unique_error});
module.exports = mongoose.model("Usuario",usuarioPDU);
