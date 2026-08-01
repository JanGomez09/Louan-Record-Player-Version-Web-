// registro


let db;

const request = indexedDB.open("RecordCollectionDB", 1);

request.onupgradeneeded = function (event) {

    db = event.target.result;

    if (!db.objectStoreNames.contains("audios")) {

        db.createObjectStore("audios", {
            keyPath: "id"
        });

    }

};

request.onsuccess = function (event) {

    db = event.target.result;

    loadCollection();

};

request.onerror = function () {

    console.log("Error abriendo IndexedDB");

};



let colection = [];

const btnRec = document.getElementById("add-record");
const btncover = document.getElementById('cover');
const showcover = document.getElementById('coverShow');
const btnformat = document.getElementById("format");

const upA = document.getElementById("sideA");
const upB = document.getElementById("sideB");

const UtlA = document.getElementById("btnSA");
const UtlB = document.getElementById("btnSB");

const DelA = document.getElementById("btnDelSA");
const DelB = document.getElementById("btnDelSB");





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

DelA.addEventListener('click', (e) => {
    if (tsA.length > 0) {
        tsA.pop();
        iA--;
        const slA = document.getElementById("lsA");
        slA.removeChild(slA.lastChild);
    }
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

DelB.addEventListener('click', (e) => {
    if (tsB.length > 0) {
        tsB.pop();
        iB--;
        const slB = document.getElementById("lsB");
        slB.removeChild(slB.lastChild);
    }
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
    document.getElementById("formatShow").src = "images/txt_11.png";
        break;
    case "EP":
    document.getElementById("formatShow").src = "images/txt_12.png";
        break;
    case "LP":
        document.getElementById("formatShow").src = "images/txt_10.png";
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

    const recAside = lA;
    const recBside = lB;
    const trackA = tsA;
    const trackB = tsB;
    const recform = btnformat.value;
    const recCover =  imagenGlobal;

    if (!recName || !recArti || !recform || !recCover || trackA.length === 0 || trackB.length === 0 || recAside.length === 0 || recBside.length === 0) {
        Swal.fire("Error", "Please fill in all fields and select at least one track for each side.", "error");
        return;
    }

    const record = {
        id: Date.now().toString(),
        name: recName,
        artist: recArti,
        format: recform,
        cover: recCover,    
        sideA: recAside,
        sideB: recBside,
        tracksA: trackA,
        tracksB: trackB,

    };

    colection.push(record);

    saveCollection();
    saveAudio(record);



    console.log(record);

    const cover = document.createElement('img');
    const disc = document.createElement('img');

   

    const liPanelS = document.getElementById('menuBottom');
    const liPanelD = liPanelS.querySelector('.rec-colect');
    const liPanel = document.createElement('div');

  
    liPanelD.appendChild(liPanel);  

    cover.src = recCover;
    liPanel.id = "panel-" + record.id;
    cover.dataset.id = record.id;
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
    

   

    console.log(cover.src);

    recIndex++;



    

    clear();

    Swal.fire("Éxito", recName + " from " + recArti + " has been added to your collection!", "success");
}); 

function clear() {
    document.getElementById("name").value = "";
    document.getElementById("artist").value = ""; 
    btnformat.value = "SP";
    showcover.src = "images/txt_8.png";
    document.getElementById("lsA").innerHTML = "";
    document.getElementById("lsB").innerHTML = "";
    upA.value = "";
    upB.value = "";
    btncover.value = "";
    lA = [];
    lB = [];
    tsA = [];
    tsB = [];
    iA = 0;
    iB = 0;
    imagenGlobal = null;

    inpSA.value = "";
    inpSB.value = "";
}

let currentRecord = null;


document.addEventListener("click", function (e) {
    const img = e.target.closest(".recPanel");

    if (!img) return;

    

    const id = img.dataset.id;

    const found = colection.find(item => item.id === id);

    

    if (!found) return;

    console.log("Record clicked:");

    loadAudio(found.id).then(audioData => {

    found.sideA = audioData.sideA;
    found.sideB = audioData.sideB;

    currentRecord = found;

    pl();

    });
});

let side = "A";

const curName = document.getElementById("curName");
const curArtist = document.getElementById("curArtist");
const curSide = document.getElementById("curSide");
const curCover = document.getElementById("curCove");

const arm = document.getElementById("arm");
const curDisc = document.getElementById("vinyl");
const curPanel = document.getElementById("curPanel");
const noo = document.getElementById("noo");

const curA = document.getElementById("curA");
const curB = document.getElementById("curB");

function pl() {

    
    curName.textContent = currentRecord.name;
    curArtist.textContent = currentRecord.artist;
    curSide.textContent = currentRecord.format + " Side: A";
    curCover.src = currentRecord.cover;

    // Limpiar listas anteriores
    curA.innerHTML = "";
    curB.innerHTML = "";

    // Agregar tracks de Side A
    currentRecord.tracksA.forEach(track => {
        const liA = document.createElement('li');
        liA.textContent = track;
        curA.appendChild(liA);
    });

    // Agregar tracks de Side B
    currentRecord.tracksB.forEach(track => {
        const liB = document.createElement('li');
        liB.textContent = track;
        curB.appendChild(liB);
    });

    
    noo.style.visibility = "hidden";
    curPanel.className = "rec-form";
    curPanel.style.visibility = "visible";

    if (currentRecord.format === "LP") {
        curDisc.src = "images/txt_10.png";
        curDisc.className = "vinyl2";
        arm.className = "armPlay";
    } else if (currentRecord.format === "EP") {
        curDisc.src = "images/txt_12.png";
        curDisc.className = "vinyl3";
        arm.className = "armPlay";
    } else if (currentRecord.format === "SP") {
        curDisc.src = "images/txt_13.png";
        curDisc.className = "vinyl4";
        arm.className = "armPlay2";
    }
    AudioStart();
    playBtn.src = "images/txt_14.png";

}

// Función para iniciar la reproducción de audio

const flipBtn = document.getElementById("turns");

const rewiBtn = document.getElementById("rewin");
const backBtn = document.getElementById("backw");

const playBtn = document.getElementById("pause");

const fordBtn = document.getElementById("fordw");
const advaBtn = document.getElementById("advan");

const stopBtn = document.getElementById("break");


let audio = null;
let currentTrack = 0;

function AudioStart() {
    if (!currentRecord) return;

    const audioList = side === "A" ? currentRecord.sideA : currentRecord.sideB;
    if (!audioList || audioList.length === 0) {
        console.warn("No audio files available for side", side);
        return;
    }

    if (audio) {
        audio.pause();
        audio.src = "";
    }

    currentTrack = 0;
    audio = new Audio();
    audio.src = URL.createObjectURL(audioList[currentTrack]);
    audio.play();

    if (audioList.length > 1) {
        audio.addEventListener('ended', () => {
            currentTrack++;
            if (currentTrack < audioList.length) {
                audio.src = URL.createObjectURL(audioList[currentTrack]);
                audio.play();
                
            }
        });
    }
}

flipBtn.addEventListener("click", () => {
    if (side === "A") {
        side = "B";
        curSide.textContent = currentRecord.format + " Side: B";
    } else {
        side = "A";
        curSide.textContent = currentRecord.format + " Side: A";
    }
    AudioStart();
});

rewiBtn.addEventListener("click", () => {
    if (audio) audio.currentTime = Math.max(0, audio.currentTime - 50000);
});

backBtn.addEventListener("click", () => {
    if (audio) audio.currentTime = Math.max(0, audio.currentTime - 10);
});

playBtn.addEventListener("click", () => {
    if (!currentRecord) return;
    if (audio) {
        if (audio.paused) {
            audio.play();
            playBtn.src = "txt_14.png"; // Cambia a icono de pausa
            if (currentRecord.format === "LP") {
                arm.className = "armPlay";
            } else if (currentRecord.format === "EP") {
                arm.className = "armPlay";
            } else if (currentRecord.format === "SP") {
                arm.className = "armPlay2";
            }
        }
        else {
            audio.pause();
            playBtn.src = "images/txt_15.png"; // Cambia a icono de reproducción
            arm.className = "arm";
        }
    }
});

fordBtn.addEventListener("click", () => {
    if (audio) audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
});

advaBtn.addEventListener("click", () => {
    if (audio) audio.currentTime = Math.min(audio.duration, audio.currentTime + 50000);
});     

stopBtn.addEventListener("click", () => {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        playBtn.src = "images/txt_15.png";
        arm.className = "arm";
        curDisc.className = "vinyl1";
        curPanel.style.visibility = "hidden";
        currentRecord = null;
        curName.textContent = "";
        curArtist.textContent = "";
        curSide.textContent = "";
        curCover.src = "images/txt_8.png";
        curA.innerHTML = "";
        curB.innerHTML = "";
        noo.style.visibility = "visible";
        side = "A";
        audio.src = "";
    }
});

const deleteBtn = document.getElementById("delete");

deleteBtn.addEventListener("click", () => {
    if (!currentRecord) return;
    
    const confirmation = confirm("Do you really really want to delete " + currentRecord.name + " from your collection?");
    if (!confirmation) return;      


    const index = colection.findIndex(item => item.id === currentRecord.id);
    if (index !== -1) {
        colection.splice(index, 1);

        const transaction = db.transaction(["audios"],"readwrite");

        transaction.objectStore("audios").delete(currentRecord.id);

        saveCollection();


        const panelToRemove = document.getElementById("panel-" + currentRecord.id);
        if (panelToRemove) panelToRemove.remove();
        Swal.fire("Deleted", "Alright, " + currentRecord.name + " has been removed from your collection.", "success");
        stopBtn.click(); // Detener reproducción y limpiar panel
    }
});


function saveAudio(record){

    if(!db){
        console.error("Database not ready");
        return;
    }

    const transaction = db.transaction(["audios"],"readwrite");

    const store = transaction.objectStore("audios");

    store.put({

        id: record.id,
        sideA: record.sideA,
        sideB: record.sideB

    });

}


function saveCollection(){

    const data = colection.map(r=>({

        id:r.id,
        name:r.name,
        artist:r.artist,
        format:r.format,
        cover:r.cover,
        tracksA:r.tracksA,
        tracksB:r.tracksB

    }));

    localStorage.setItem("collection",JSON.stringify(data));

}

function loadAudio(id){

    return new Promise((resolve,reject)=>{

        const transaction = db.transaction(["audios"],"readonly");

        const store = transaction.objectStore("audios");

        const request = store.get(id);

        request.onsuccess = ()=>{

            resolve(request.result);

        };

        request.onerror = ()=>{

            reject();

        };

    });

}


function loadCollection(){

    const saved = localStorage.getItem("collection");

    if(!saved) return;

    try{

        colection = JSON.parse(saved);

    }catch{

        colection=[];

    }

    recIndex = colection.length;

    colection.forEach(record=>{

        const cover=document.createElement("img");
        const disc=document.createElement("img");

        const liPanelS=document.getElementById("menuBottom");
        const liPanelD=liPanelS.querySelector(".rec-colect");

        const liPanel=document.createElement("div");

        liPanel.id = "panel-" + record.id;

        cover.src=record.cover;

        cover.dataset.id = record.id;

        cover.className="recPanel";

        if(record.format==="LP")
            disc.src="images/txt_10.png";

        if(record.format==="EP")
            disc.src="images/txt_12.png";

        if(record.format==="SP")
            disc.src="images/txt_11.png";

        disc.className="discPanel";

        liPanel.appendChild(cover);
        liPanel.appendChild(disc);

        liPanelD.appendChild(liPanel);

    });

}
