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


// ----- LPx2: caras C y D (segundo disco) -----
// Mismo funcionamiento que las caras A y B: archivos de audio + tracklist.
const extraSides = {
    C: { files: [], tracks: [], count: 0 },
    D: { files: [], tracks: [], count: 0 }
};

["C", "D"].forEach(function (letter) {

    document.getElementById("side" + letter).addEventListener("change", (e) => {
        extraSides[letter].files = Array.from(e.target.files);
    });

    document.getElementById("btnS" + letter).addEventListener("click", () => {
        const s = extraSides[letter];
        const text = document.getElementById("inpS" + letter).value;

        s.count++;
        const song = letter + s.count + " " + text;
        s.tracks.push(song);

        const li = document.createElement("li");
        li.textContent = song;
        document.getElementById("ls" + letter).appendChild(li);
    });

    document.getElementById("btnDelS" + letter).addEventListener("click", () => {
        const s = extraSides[letter];

        if (s.tracks.length > 0) {
            s.tracks.pop();
            s.count--;
            const list = document.getElementById("ls" + letter);
            if (list.lastElementChild) list.removeChild(list.lastElementChild);
        }
    });
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

// Muestra el formato elegido y, solo con LPx2, los campos de las caras C y D
function updateFormatUI() {
    const images = {
        SP: "images/txt_11.png",
        EP: "images/txt_12.png",
        LP: "images/txt_10.png",
        LPx2: "images/txt_10.png"
    };

    document.getElementById("formatShow").src = images[btnformat.value] || images.LP;
    document.getElementById("menuLeft").classList.toggle("is-lpx2", btnformat.value === "LPx2");
}

btnformat.addEventListener('change', updateFormatUI);
updateFormatUI();   // el navegador puede recordar el valor del selector al recargar

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

    const isLpx2 = recform === "LPx2";
    const missingExtra = isLpx2 && (
        extraSides.C.tracks.length === 0 || extraSides.D.tracks.length === 0 ||
        extraSides.C.files.length === 0 || extraSides.D.files.length === 0
    );

    if (!recName || !recArti || !recform || !recCover || trackA.length === 0 || trackB.length === 0 || recAside.length === 0 || recBside.length === 0 || missingExtra) {
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

    if (isLpx2) {
        record.sideC = extraSides.C.files;
        record.sideD = extraSides.D.files;
        record.tracksC = extraSides.C.tracks;
        record.tracksD = extraSides.D.tracks;
    }

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

    if (recform == "EP") {
        disc.src = "images/txt_12.png";
    } else if (recform == "SP") {
        disc.src = "images/txt_11.png";
    } else {
        disc.src = "images/txt_10.png";   // LP y LPx2
    }
    disc.id = recName + recform;
    disc.className = 'discPanel';

    
    liPanel.appendChild(cover);     
    liPanel.appendChild(disc);

    console.log(cover.id);
    

   

    console.log(cover.src);

    recIndex++;

    filterCollection();

    clear();

    Swal.fire("Éxito", recName + " from " + recArti + " has been added to your collection!", "success");
}); 

function clear() {
    document.getElementById("name").value = "";
    document.getElementById("artist").value = ""; 
    btnformat.value = "SP";
    updateFormatUI();
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

    // LPx2: caras C y D (se crean objetos nuevos porque el disco guardado conserva los anteriores)
    extraSides.C = { files: [], tracks: [], count: 0 };
    extraSides.D = { files: [], tracks: [], count: 0 };
    ["C", "D"].forEach(function (letter) {
        document.getElementById("ls" + letter).innerHTML = "";
        document.getElementById("side" + letter).value = "";
        document.getElementById("inpS" + letter).value = "";
    });

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
    found.sideC = audioData.sideC;
    found.sideD = audioData.sideD;

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
const curC = document.getElementById("curC");
const curD = document.getElementById("curD");

// Botón para alternar entre el disco A y el disco B (solo visible con un LPx2)
const discBtn = document.getElementById("discSwap");

function fillTracklist(list, tracks) {
    list.innerHTML = "";

    (tracks || []).forEach(track => {
        const li = document.createElement('li');
        li.textContent = track;
        list.appendChild(li);
    });
}

function pl() {

    side = "A";   // un disco nuevo siempre empieza por la cara A
    const isLpx2 = currentRecord.format === "LPx2";

    curName.textContent = currentRecord.name;
    curArtist.textContent = currentRecord.artist;
    curSide.textContent = sideLabel();
    curCover.src = currentRecord.cover;

    // Tracklists (C y D solo existen en un LPx2)
    fillTracklist(curA, currentRecord.tracksA);
    fillTracklist(curB, currentRecord.tracksB);
    fillTracklist(curC, currentRecord.tracksC);
    fillTracklist(curD, currentRecord.tracksD);


    noo.style.visibility = "hidden";
    curPanel.className = "rec-form";
    curPanel.classList.toggle("is-lpx2", isLpx2);
    curPanel.style.visibility = "visible";
    discBtn.hidden = !isLpx2;

    if (currentRecord.format === "LP" || isLpx2) {
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

// Convierte el archivo guardado en una URL reproducible. Algunos Android entregan
// los archivos sin tipo MIME y el WebView no los reproduce: en ese caso se le asigna uno.
function audioUrl(file) {
    let blob = file;

    if (!file.type || file.type.indexOf("audio/") !== 0) {
        const name = (file.name || "").toLowerCase();
        let type = "audio/mpeg";
        if (name.endsWith(".m4a") || name.endsWith(".mp4") || name.endsWith(".aac")) type = "audio/mp4";
        else if (name.endsWith(".wav")) type = "audio/wav";
        else if (name.endsWith(".ogg") || name.endsWith(".opus")) type = "audio/ogg";
        else if (name.endsWith(".flac")) type = "audio/flac";
        blob = new Blob([file], { type: type });
    }

    return URL.createObjectURL(blob);
}

// Avisa cuando el audio no se puede reproducir (antes fallaba en silencio)
function reportAudioError(err) {
    if (err && err.name === "AbortError") return;   // cambio de pista, es normal
    if (audio) {                                     // un solo aviso por pista
        if (audio.reportedError) return;
        audio.reportedError = true;
    }

    const media = (audio && audio.error) ? " (media error " + audio.error.code + ")" : "";
    const detail = ((err && err.name) ? err.name : "Error") + ((err && err.message) ? ": " + err.message : "") + media;

    console.error("Audio error:", err, audio && audio.error);

    // Pista para el usuario según el tipo de error del navegador
    let hint = "";
    if (audio && audio.error && audio.error.code === 3) {
        hint = " The audio data looks damaged: try adding the record again with another copy of the file.";
    } else if (audio && audio.error && audio.error.code === 4) {
        hint = " The audio format is not supported by this device.";
    }

    if (window.Swal) {
        Swal.fire("Audio problem", "This track could not be played." + hint + " (" + detail + ")", "error");
    }
}

function playAudio() {
    if (!audio) return;
    const attempt = audio.play();
    if (attempt && attempt.catch) attempt.catch(reportAudioError);
}

// ----- Audio de mantenimiento (pantalla apagada en el teléfono) -----
// Al terminar una canción el navegador suelta el "audio focus" de Android y, para empezar
// la siguiente, tiene que pedirlo otra vez. Con la pantalla apagada Android puede negarlo
// y la canción se pausa apenas empieza. Mientras suena el disco se reproduce en bucle un
// audio completamente silencioso: así el sistema siempre ve un reproductor activo y el foco
// no se suelta entre canción y canción. Se detiene solo cuando el disco deja de sonar.

let keepAliveEl = null;
let keepAliveTimer = null;

function silentWavUrl() {
    const seconds = 1, rate = 8000;
    const dataSize = rate * seconds * 2;                 // 16 bits, mono
    const view = new DataView(new ArrayBuffer(44 + dataSize));
    const text = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };

    text(0, "RIFF");  view.setUint32(4, 36 + dataSize, true);  text(8, "WAVE");
    text(12, "fmt "); view.setUint32(16, 16, true);  view.setUint16(20, 1, true);  view.setUint16(22, 1, true);
    view.setUint32(24, rate, true);  view.setUint32(28, rate * 2, true);  view.setUint16(32, 2, true);  view.setUint16(34, 16, true);
    text(36, "data"); view.setUint32(40, dataSize, true);   // el resto son ceros = silencio

    return URL.createObjectURL(new Blob([view.buffer], { type: "audio/wav" }));
}

function keepAliveStart() {
    try {
        if (!keepAliveEl) {
            keepAliveEl = new Audio();
            keepAliveEl.src = silentWavUrl();
            keepAliveEl.loop = true;
        }
        if (keepAliveEl.paused) {
            const attempt = keepAliveEl.play();
            if (attempt && attempt.catch) attempt.catch(() => {});
        }
    } catch (e) {
        console.warn("No se pudo iniciar el audio de mantenimiento", e);
    }
}

function keepAliveStop() {
    if (keepAliveEl && !keepAliveEl.paused) keepAliveEl.pause();
}

// El audio de mantenimiento sigue al reproductor: al pausarse o terminar el disco se apaga.
// Se espera un momento porque entre una canción y la siguiente hay una pausa de milisegundos.
function keepAliveCheck() {
    clearTimeout(keepAliveTimer);
    keepAliveTimer = setTimeout(() => {
        if (!audio || audio.paused) {
            // Aviso para diagnóstico: el sistema pausó el audio sin que el usuario lo pidiera
            if (audio && audio.paused && !audio.ended && !audio.userPaused && document.visibilityState === "hidden") {
                console.warn("[audio] El sistema pausó la reproducción con la app en segundo plano");
            }
            keepAliveStop();
        }
    }, 800);
}

// ----- Aviso al cerrar o refrescar mientras suena un disco -----
window.addEventListener("beforeunload", (e) => {
    if (audio && !audio.paused) {
        e.preventDefault();
        e.returnValue = "";   // el navegador muestra su propio mensaje de confirmación
    }
});

// ----- Caras y discos -----
// Un LP tiene las caras A y B. Un LPx2 tiene dos discos: el disco A (caras A y B)
// y el disco B (caras C y D).

function discOf(s) {
    return (s === "C" || s === "D") ? "B" : "A";
}

function otherSide(s) {
    return { A: "B", B: "A", C: "D", D: "C" }[s];
}

function sideLabel() {
    if (currentRecord.format === "LPx2") {
        return "Disc " + discOf(side) + " - Side " + side;
    }
    return currentRecord.format + " Side: " + side;
}

// Iconos y brazo según se esté reproduciendo o no
function showPlayingState() {
    playBtn.src = "images/txt_14.png";                                    // icono de pausa
    arm.className = currentRecord.format === "SP" ? "armPlay2" : "armPlay";
}

function showPausedState() {
    playBtn.src = "images/txt_15.png";                                    // icono de reproducción
    arm.className = "arm";
}

// Pasa a otra cara (o a la primera cara del otro disco) y la reproduce
function playSide(newSide) {
    if (!currentRecord) return;

    side = newSide;
    curSide.textContent = sideLabel();

    if (AudioStart()) {
        showPlayingState();
    } else {
        showPausedState();
    }
}

// Qué cara sigue cuando una termina, según las opciones de Configuración
// (window.playbackOptions lo escribe settings.js). Devuelve null si no hay cambio automático.
function nextSideAfterEnd() {
    const options = window.playbackOptions || {};
    let next = null;

    if (side === "A" || side === "C") {
        if (options.autoFlip) next = otherSide(side);                 // A -> B   |   C -> D
    } else if (side === "B" && currentRecord.format === "LPx2") {
        if (options.autoDisc) next = "C";                             // fin del disco A -> disco B
    }

    if (next) {
        const files = currentRecord["side" + next];
        if (!files || files.length === 0) return null;
    }

    return next;
}

// Cuando termina una canción: pasa a la siguiente de la cara y, al acabar la cara, aplica el cambio automático
function onTrackEnded(audioList) {
    if (!currentRecord) return;

    currentTrack++;

    if (currentTrack < audioList.length) {
        audio.reportedError = false;
        audio.src = audioUrl(audioList[currentTrack]);
        playAudio();
        return;
    }

    const next = nextSideAfterEnd();

    if (next) {
        playSide(next);
    } else {
        showPausedState();   // fin de la cara: el brazo se levanta
    }
}

function AudioStart() {
    if (!currentRecord) return false;

    const audioList = currentRecord["side" + side];
    if (!audioList || audioList.length === 0) {
        console.warn("No audio files available for side", side);
        return false;
    }

    // Se reutiliza el mismo elemento de audio: así el cambio automático de cara o de disco
    // sigue sonando aunque en ese momento no haya un toque del usuario.
    if (!audio) {
        audio = new Audio();
        audio.addEventListener("play", keepAliveStart);
        audio.addEventListener("pause", keepAliveCheck);
    }
    audio.userPaused = false;

    audio.pause();
    audio.onerror = null;
    audio.onended = null;

    currentTrack = 0;
    audio.reportedError = false;
    audio.volume = (typeof currentVolume === "number") ? currentVolume : 1; // volumen de Configuración
    audio.src = audioUrl(audioList[currentTrack]);
    audio.onerror = () => reportAudioError(audio.error);
    audio.onended = () => onTrackEnded(audioList);
    playAudio();

    return true;
}

// Cambiar de cara dentro del mismo disco (A <-> B, o C <-> D en el disco B de un LPx2)
flipBtn.addEventListener("click", () => {
    if (!currentRecord) return;
    playSide(otherSide(side));
});

// Alternar entre el disco A y el disco B (solo LPx2): empieza por la primera cara del otro disco
discBtn.addEventListener("click", () => {
    if (!currentRecord || currentRecord.format !== "LPx2") return;
    playSide(discOf(side) === "A" ? "C" : "A");
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
            audio.userPaused = false;
            playAudio();
            showPlayingState();
        }
        else {
            audio.userPaused = true;
            audio.pause();
            showPausedState();
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
        audio.userPaused = true;
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
        curC.innerHTML = "";
        curD.innerHTML = "";
        curPanel.classList.remove("is-lpx2");
        discBtn.hidden = true;
        noo.style.visibility = "visible";
        side = "A";
        audio.onerror = null;
        audio.onended = null;
        audio.src = "";
        keepAliveCheck();   // al vaciar el src el navegador descarta el evento "pause", se avisa aquí
    }
});

// ----- Buscador de la colección -----
// Filtra los discos mientras se escribe. Busca en el nombre del disco y en el artista,
// sin distinguir mayúsculas ni acentos, y todas las palabras escritas deben coincidir.
// Enter reproduce el primer resultado (igual que tocar su portada).
const recSearch = document.getElementById("recSearch");
const recNoResults = document.getElementById("recNoResults");

function normalizeText(text) {
    return String(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function filterCollection() {
    const words = normalizeText(recSearch.value).split(/\s+/).filter(Boolean);
    let visible = 0;

    colection.forEach(record => {
        const panel = document.getElementById("panel-" + record.id);
        if (!panel) return;

        const text = normalizeText(record.name + " " + record.artist);
        const match = words.every(word => text.includes(word));

        panel.hidden = !match;
        if (match) visible++;
    });

    recNoResults.hidden = !(words.length > 0 && colection.length > 0 && visible === 0);
}

recSearch.addEventListener("input", filterCollection);

recSearch.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    const first = document.querySelector("#rec-colect > div:not([hidden]) .recPanel");
    if (first) {
        first.click();
        recSearch.blur();   // en el teléfono baja el teclado
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
        filterCollection();
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
        sideB: record.sideB,
        sideC: record.sideC,
        sideD: record.sideD

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
        tracksB:r.tracksB,
        tracksC:r.tracksC,
        tracksD:r.tracksD

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

        if(record.format==="LP" || record.format==="LPx2")
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
