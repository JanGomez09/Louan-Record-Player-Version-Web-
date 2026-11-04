const btnAdd = document.getElementById("add");
const btnTrack = document.getElementById("trackL");
const btnColect = document.getElementById("colect");
const btnSeting = document.getElementById("seting");

const interface = document.getElementById("app");
const menuTop = document.getElementById("menuTop");



// Función para cerrar todos

let togs = [false,false,false];

btnAdd.addEventListener("click", () => {
  interface.classList.remove("active3");
  interface.classList.remove("active2");
  interface.classList.toggle("active1");
  interface.classList.remove("up");


  const abierto = menuLeft.classList.contains("active");
  cerrarTodos();
  if (!abierto) menuLeft.classList.add("active");
}); 

btnTrack.addEventListener("click", () => {
  interface.classList.remove("active1");
  interface.classList.remove("active3");
  interface.classList.toggle("active2");
  interface.classList.remove("up");


  const abierto = menuRight.classList.contains("active");
  cerrarTodos();
  if (!abierto) menuRight.classList.add("active");

}); 


btnColect.addEventListener("click", () => {
  interface.classList.remove("active1");
  interface.classList.remove("active2");
  interface.classList.toggle("active3");
  interface.classList.remove("up");


  const abierto = menuBottom.classList.contains("active");
  cerrarTodos();
  if (!abierto) menuBottom.classList.add("active");
}); 

btnSeting.addEventListener("click", () => {
  interface.classList.remove("active1");
  interface.classList.remove("active2");
  interface.classList.remove("active3");
  interface.classList.toggle("up");

  cerrarTodos();
  // El panel de configuración baja desde arriba junto con la tarjeta
  if (interface.classList.contains("up")) menuTop.classList.add("active");
});


function cerrarTodos() {
  menuLeft.classList.remove("active");
  menuRight.classList.remove("active");
  menuBottom.classList.remove("active");
  menuTop.classList.remove("active");
}



