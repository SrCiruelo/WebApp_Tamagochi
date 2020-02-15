var productos;
var login_post = ()=>{
    var xhr = new XMLHttpRequest();
    var id = document.forms["my_form"]["id"].value;
    var pass   = document.forms["my_form"]["pass"].value;
    if(pass=="" || id=="") return false;
    let params = `id=${id}&pass=${pass}`;
    xhr.open('POST','http://localhost:3000/login',true);
    xhr.onload = function()
    {
        if(this.status == 200){
            window.location.href = "http://localhost:3000/common_user"
        }
        else{
            let error = JSON.parse(this.response);
            console.log(error.err);
        }
    }

    
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhr.send(params);
}

var check_bought_products = ()=>{
    var xhr = new XMLHttpRequest();
    xhr.open('POST','http://localhost:3000/BoughtProducts',true);
    xhr.onload = function()
    {
        if(this.status == 200){
            let compras = JSON.parse(this.response).compras;
            productos = compras;
            productos.forEach(element => {
                set_bought(element);
            });
            console.log(productos);
        }
        else{
            let error = JSON.parse(this.response);
            console.log(error.err);
        }
    }
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhr.send();
}
var set_bought = (nombre)=>{
    var my_button = document.getElementById(nombre + "_button");
    my_button.classList.remove("btn-success")
    my_button.classList.add("btn-danger");
    my_button.innerHTML = "Comprado";
}

var set_used = (nombre)=>{
    var my_button = document.getElementById(nombre + "_button");
    my_button.classList.remove("btn-danger")
    my_button.classList.add("btn-success");
    my_button.innerHTML = "Comprar";
}
var buy = (nombre)=>{
    if(productos.find(element=>element==nombre)){
        return;
    }
    var xhr = new XMLHttpRequest();
    let params = `nombre=${nombre}`;
    xhr.open('POST','http://localhost:3000/Buy',true);
    xhr.onload = function()
    {
        if(this.status == 200){
            console.log("I should buy it");
            productos.push(nombre);
            set_bought(nombre);
        }
        else{
            let error = JSON.parse(this.response);
            console.log(error.err);
        }
    }
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhr.send(params);
}

var dar_producto = (nombre_producto,nombre_tamagochi)=>{
    if(!productos.find(element=>element==nombre_producto)){
        return;
    }
    var xhr = new XMLHttpRequest();
    let params = `nombre_producto=${nombre_producto}&nombre_tamagochi=${nombre_tamagochi}`;
    xhr.open('POST','http://localhost:3000/TamagochiUsarItem',true);
    xhr.onload = function()
    {
        if(this.status == 200)
        {
            set_used(nombre_producto);
            let index = productos.findIndex(element => element==nombre_producto);
            productos.splice(index,1);
        }
        else{
            let error = JSON.parse(this.response);
            console.log(error.err);
        }
    }
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhr.send(params);
}

var CreateTamagochi = (nombre)=>{
    var xhr = new XMLHttpRequest();
    let params = `nombre=${nombre}`;
    xhr.open('POST','http://localhost:3000/TamagochiCreate',true);
    xhr.onload = function()
    {
        if(this.status == 200)
        {
            console.log(this.response);
        }
        else{
            let error = JSON.parse(this.response);
            console.log(error.err);
        }
    }
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhr.send(params);
}
