const btnAdd = document.getElementById("add");
const btnTrack = document.getElementById("trackL");
const btnColect = document.getElementById("colect");

const interface = document.getElementById("app");



// Función para cerrar todos

let togs = [false,false,false];

btnAdd.addEventListener("click", () => {
  interface.classList.remove("active3");
  interface.classList.remove("active2");
  interface.classList.toggle("active1");
  


  const abierto = menuLeft.classList.contains("active");
  cerrarTodos();
  if (!abierto) menuLeft.classList.add("active");
}); 

btnTrack.addEventListener("click", () => {
  interface.classList.remove("active1");
  interface.classList.remove("active3");
  interface.classList.toggle("active2");



  const abierto = menuRight.classList.contains("active");
  cerrarTodos();
  if (!abierto) menuRight.classList.add("active");

}); 


btnColect.addEventListener("click", () => {
  interface.classList.remove("active1");
  interface.classList.remove("active2");
  interface.classList.toggle("active3");


  const abierto = menuBottom.classList.contains("active");
  cerrarTodos();
  if (!abierto) menuBottom.classList.add("active");
}); 


function cerrarTodos() {
  menuLeft.classList.remove("active");
  menuRight.classList.remove("active");
  menuBottom.classList.remove("active");
}



