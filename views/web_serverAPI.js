var productos;
var login_post = (id,pass)=>{
    var xhr = new XMLHttpRequest();
    if(!id)
    var id = document.forms["my_form"]["id"].value;
    if(!pass)
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
var register_post = ()=>{
    var xhr = new XMLHttpRequest();
    var id = document.forms["my_form"]["id"].value;
    var pass   = document.forms["my_form"]["pass"].value;
    if(pass=="" || id=="") return false;
    let params = `id=${id}&pass=${pass}`;
    xhr.open('POST','http://localhost:3000/CreateNormalUser',true);
    xhr.onload = function()
    {
        if(this.status == 200){
            login_post(id,pass);
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

var set_bought_products = ()=>{
  productos.forEach(element => {
      set_bought(element);
  });
}

var set_bought = (nombre)=>{
    var my_button = document.getElementById(nombre + "_button");
    my_button.classList.remove("btn-success")
    my_button.classList.add("btn-danger");
    my_button.innerHTML = "Comprado";
}

var set_used_product_inShop = (nombre)=>{
    var my_button = document.getElementById(nombre + "_button");
    my_button.classList.remove("btn-danger")
    my_button.classList.add("btn-success");
    my_button.innerHTML = "Comprar";
}
var set_used_product_inPerfil = (nombre,tamagochi)=>{
    var my_button = document.getElementById(nombre + "_button");
    var my_container = document.getElementById(nombre + "_div");
    my_button.classList.remove("btn-success");
    my_button.classList.add("btn-danger");
    my_container.classList.add("fade-out");
    var my_container = document.getElementById(nombre + "_div");
    
    var sueno_bar    = document.getElementById("sueno_bar");
    var hambre_bar   = document.getElementById("hambre_bar");
    var limpieza_bar = document.getElementById("limpieza_bar");

    sueno_bar.style.width    = tamagochi.sueno/3   + "%";
    hambre_bar.style.width   = tamagochi.hambre/3  + "%";
    limpieza_bar.style.width = tamagochi.limpeza/3 + "%"; 
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
            tamagochi = JSON.parse(this.response).tamagochi;
            console.log(tamagochi);
            set_used_product_inPerfil(nombre_producto,tamagochi);
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

var load_tienda = (nombre)=>{
  check_bought_products();
  set_bought_products();
}

