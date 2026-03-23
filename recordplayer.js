const colection = [];

const btnRec = document.getElementById("add-record");
const btncover = document.getElementById('cover');
const showcover = document.getElementById('coverShow');

// Variable global
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





btnRec.addEventListener("click", () => {
    const recName = document.getElementById("name").value;
    const recArti = document.getElementById("artist").value;
    const recGenr = document.getElementById("genera").value;
    const recYear = document.getElementById("year").value;
    const recform = document.getElementById("format").value;
    const recCover =  imagenGlobal;


    const sA = [];
    const sB = [];

    

    const record = {
        name: recName,
        artist: recArti,
        genera: recGenr,
        year: recYear,
        format: recform,
        cover: recCover,

    };

    

    console.log(record);


}); 