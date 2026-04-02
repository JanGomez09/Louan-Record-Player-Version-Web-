// registro

let colection = [];

const btnRec = document.getElementById("add-record");
const btncover = document.getElementById('cover');
const showcover = document.getElementById('coverShow');
const btnformat = document.getElementById("format");

const upA = document.getElementById("sideA");
const upB = document.getElementById("sideB");

const UtlA = document.getElementById("btnSA");
const UtlB = document.getElementById("btnSB");




let lA = [];

let lB = [];

let tsA = [];

let tsB = [];

let iA = 0;
let iB = 0;
//Tracklist

UtlA.addEventListener('click', (e) => {

    let inpSA = document.getElementById("inpSA").value;
    

    iA++
    let song = "A";

    song += iA + " " + inpSA;

    tsA.push(song);

 

    const slA = document.getElementById("lsA");
    const newSongA = document.createElement('li');

    newSongA.textContent = song;
    slA.appendChild(newSongA);
});


UtlB.addEventListener('click', (e) => {

    let inpSB = document.getElementById("inpSB").value;


    iB++
    let song = "B";

    song += iB + " " + inpSB;

    tsB.push(song);



    const slB = document.getElementById("lsB");
    const newSongB = document.createElement('li');

    newSongB.textContent = song;
    slB.appendChild(newSongB);
});


//audios


upA.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);

    lA = files; 
});

upB.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);

    lB = files; 
});

//formato

btnformat.addEventListener('change', function(e) {
switch (btnformat.value) {
    case "SP":
    document.getElementById("formatShow").src = "txt_11.png";
        break;
    case "EP":
    document.getElementById("formatShow").src = "txt_12.png";
        break;
    case "LP":
        document.getElementById("formatShow").src = "txt_10.png";
    break;
}
});

//portada

let imagenGlobal = null;

btncover.addEventListener('change', function(e) {
    const archivo = e.target.files[0];

    if (archivo) {
        const reader = new FileReader();

        reader.onload = function(evento) {
            const img = new Image();

            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = 192;
                canvas.height = 192;

                ctx.drawImage(img, 0, 0, 192, 192);

                // Guardar en variable global
                imagenGlobal = canvas.toDataURL('image/png');

                // Mostrar en el <img>
                showcover.src = imagenGlobal;
            }

            img.src = evento.target.result;
        }

        reader.readAsDataURL(archivo);
    }
});


//añadir
let recIndex = 0;


btnRec.addEventListener("click", () => {
    const recName = document.getElementById("name").value;
    const recArti = document.getElementById("artist").value;
    const recGenr = document.getElementById("genera").value;
    const recYear = document.getElementById("year").value;
    const recAside = lA;
    const recBside = lB;
    const trackA = tsA;
    const trackB = tsB;
    const recform = btnformat.value;
    const recCover =  imagenGlobal;

    const record = {
        id: recIndex,
        name: recName,
        artist: recArti,
        genera: recGenr,
        year: recYear,
        format: recform,
        cover: recCover,    
        sideA: recAside,
        sideB: recBside,
        tracksA: trackA,
        tracksB: trackB,

    };

    colection.push(record);



    console.log(record);

    const cover = document.createElement('img');
    const disc = document.createElement('img');

   

    const liPanelS = document.getElementById('menuBottom');
    const liPanelD = liPanelS.querySelector('.rec-colect');
    const liPanel = document.createElement('div');

  
    liPanelD.appendChild(liPanel);  

    cover.src = recCover;
    liPanel.id = recName;
    cover.id = "disc" + recIndex;
    cover.className = "recPanel";

    if (recform == "LP") {
        disc.src = "txt_10.png";
    } else if (recform == "EP") {
        disc.src = "txt_12.png";
    } else if (recform == "SP") {
        disc.src = "txt_11.png";
    }
    disc.id = recName + recform;
    disc.className = 'discPanel';

    
    liPanel.appendChild(cover);     
    liPanel.appendChild(disc);

    console.log(cover.id);
    

    iA = 0;
    iB = 0;
    imagenGlobal = null;

    console.log(cover.src);

    recIndex++;
}); 

let currentRecord = null;


document.addEventListener("click", function (e) {
  const img = e.target.closest("img");

  // Verifica que el id sea tipo "disc0", "disc1", etc.
  if (img && /^disc\d+$/.test(img.id)) {

    // Extraer el número del id
    const idNumero = parseInt(img.id.replace("disc", ""), 10);

    // Buscar en la colección usando el número
    const found = colection.find(item => item.id === idNumero);

    if (found) {
      currentRecord = found;
      console.log("Registro actual:", currentRecord);
    } else {
      console.log("No se encontró el registro");
    }
  }
});