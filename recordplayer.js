const colection = [];

const btnRec = document.getElementById("add-record");
const btncover = document.getElementById('cover');
const showcover = document.getElementById('coverShow');
const btnformat = document.getElementById("format");

const upA = document.getElementById("sideA");
const upB = document.getElementById("sideB");

let lA = [];

let lB = [];

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


btnRec.addEventListener("click", () => {
    const recName = document.getElementById("name").value;
    const recArti = document.getElementById("artist").value;
    const recGenr = document.getElementById("genera").value;
    const recYear = document.getElementById("year").value;
    const recAside = lA;
    const recBside = lB;
    const recform = btnformat.value;
    const recCover =  imagenGlobal;




    

    const record = {
        name: recName,
        artist: recArti,
        genera: recGenr,
        year: recYear,
        format: recform,
        cover: recCover,    
        sideA: recAside,
        sideB: recBside

    };

    

    console.log(record);


}); 