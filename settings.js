// ===== Configuración de la página =====
// Tema de colores, volumen, cambio automático de cara/disco y borrado de la colección.
// Las configuraciones se guardan en localStorage (clave "louanSettings");
// la colección sigue guardándose en la clave "collection" (recordplayer.js).

(function () {

    const SETTINGS_KEY = "louanSettings";
    const THEMES = ["dark", "light", "warm", "cool"];
    const DEFAULTS = { theme: "dark", volume: 100, autoFlip: false, autoDisc: false };

    // ---------- Lectura / escritura en localStorage ----------

    function loadSettings() {
        const result = {
            theme: DEFAULTS.theme,
            volume: DEFAULTS.volume,
            autoFlip: DEFAULTS.autoFlip,
            autoDisc: DEFAULTS.autoDisc
        };

        try {
            const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY));

            if (raw && THEMES.includes(raw.theme)) {
                result.theme = raw.theme;
            }
            if (raw && typeof raw.volume === "number" && isFinite(raw.volume)) {
                result.volume = Math.min(100, Math.max(0, Math.round(raw.volume)));
            }
            if (raw && typeof raw.autoFlip === "boolean") {
                result.autoFlip = raw.autoFlip;
            }
            if (raw && typeof raw.autoDisc === "boolean") {
                result.autoDisc = raw.autoDisc;
            }
        } catch (e) {
            // Si el dato está dañado se usan los valores por defecto
        }

        return result;
    }

    function storeSettings() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.warn("No se pudo guardar la configuración", e);
        }
    }

    const settings = loadSettings();

    // ---------- Elementos ----------

    const appCard = document.getElementById("app");
    const themeButtons = Array.from(document.querySelectorAll("#menuTop [data-theme]"));
    const saveThemeBtn = document.getElementById("saveTheme");
    const themeNote = document.getElementById("themeNote");
    const volumeInput = document.getElementById("volume");
    const volumeValue = document.getElementById("volumeValue");
    const deleteAllBtn = document.getElementById("deleteAll");
    const autoFlipBtn = document.getElementById("autoFlip");
    const autoDiscBtn = document.getElementById("autoDisc");

    // ---------- Avisos ----------

    function toast(message, icon) {
        if (!window.Swal) return;
        Swal.fire({
            toast: true,
            position: "top",
            icon: icon || "success",
            title: message,
            showConfirmButton: false,
            timer: 1800
        });
    }

    // Confirmación con SweetAlert2 (si no cargó, usa el confirm() del navegador)
    function ask(options) {
        if (window.Swal) {
            return Swal.fire({
                title: options.title,
                text: options.text,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: options.confirm,
                confirmButtonColor: options.danger ? "#c62828" : undefined,
                cancelButtonText: "Cancel",
                reverseButtons: true,
                focusCancel: true
            }).then(function (result) { return result.isConfirmed; });
        }
        return Promise.resolve(window.confirm(options.title + "\n\n" + options.text));
    }

    // ---------- Tema de colores ----------
    // Al tocar un tema se ve de inmediato (vista previa). Solo "Save Colors"
    // lo guarda; si se cierra el panel sin guardar, vuelve al tema guardado.

    let pendingTheme = settings.theme;

    function syncSystemBars(theme) {
        // En la app de Android: íconos oscuros en la barra de estado si el fondo es claro
        try {
            const bars = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SystemBars;
            if (bars && bars.setStyle) {
                Promise.resolve(bars.setStyle({ style: theme === "light" ? "LIGHT" : "DARK" })).catch(function () {});
            }
        } catch (e) {}
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        syncSystemBars(theme);
    }

    function renderThemeUI() {
        themeButtons.forEach(function (btn) {
            btn.classList.toggle("sel", btn.dataset.theme === pendingTheme);
        });
        themeNote.textContent = (pendingTheme === settings.theme)
            ? "Saved colors"
            : "Preview only: press Save Colors to keep it";
    }

    themeButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            pendingTheme = btn.dataset.theme;
            applyTheme(pendingTheme);
            renderThemeUI();
        });
    });

    saveThemeBtn.addEventListener("click", function () {
        settings.theme = pendingTheme;
        storeSettings();
        renderThemeUI();
        toast("Colors saved");
    });

    // ---------- Volumen ----------

    function renderVolume(percent) {
        volumeInput.value = percent;
        volumeValue.textContent = percent + "%";
        volumeInput.style.setProperty("--val", percent + "%");
    }

    function setVolume(percent) {
        window.currentVolume = percent / 100;      // lo usa recordplayer.js al iniciar cada canción

        // Si ya hay algo sonando, el cambio se oye al instante
        if (typeof audio !== "undefined" && audio) {
            audio.volume = window.currentVolume;
        }
    }

    volumeInput.addEventListener("input", function () {
        const percent = Number(volumeInput.value);
        settings.volume = percent;
        renderVolume(percent);
        setVolume(percent);
        storeSettings();
    });

    // ---------- Cambio automático de cara y de disco ----------
    // Auto Flip Side: al terminar una cara pasa a la otra del mismo disco (A -> B, C -> D).
    // Auto Change Disc (solo LPx2): al terminar la cara B pasa al disco B (cara C).
    // recordplayer.js lee window.playbackOptions cada vez que termina una cara.

    function syncPlaybackOptions() {
        window.playbackOptions = { autoFlip: settings.autoFlip, autoDisc: settings.autoDisc };
    }

    function renderToggle(button, label, on) {
        button.textContent = label + ": " + (on ? "On" : "Off");
        button.classList.toggle("sel", on);
        button.setAttribute("aria-pressed", on ? "true" : "false");
    }

    function renderPlaybackToggles() {
        renderToggle(autoFlipBtn, "Auto Flip Side", settings.autoFlip);
        renderToggle(autoDiscBtn, "Auto Change Disc (LPx2)", settings.autoDisc);
    }

    autoFlipBtn.addEventListener("click", function () {
        settings.autoFlip = !settings.autoFlip;
        syncPlaybackOptions();
        renderPlaybackToggles();
        storeSettings();
    });

    autoDiscBtn.addEventListener("click", function () {
        settings.autoDisc = !settings.autoDisc;
        syncPlaybackOptions();
        renderPlaybackToggles();
        storeSettings();
    });

    // ---------- Borrar toda la colección (doble confirmación) ----------

    function resetPlayerPanel() {
        // Misma limpieza que hace el botón de stop cuando no hay audio cargado
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
        playBtn.src = "images/txt_15.png";
        side = "A";
    }

    function wipeCollection() {
        // 1) Detener lo que esté sonando
        if (audio) {
            stopBtn.click();
        }
        if (currentRecord) {
            resetPlayerPanel();
        }

        // 2) Vaciar la colección en memoria, en pantalla y en localStorage
        colection.length = 0;
        recIndex = 0;
        document.getElementById("rec-colect").innerHTML = "";
        saveCollection();
        filterCollection();

        // 3) Borrar también las canciones guardadas en IndexedDB
        if (db) {
            db.transaction(["audios"], "readwrite").objectStore("audios").clear();
        }
    }

    deleteAllBtn.addEventListener("click", function () {
        const total = colection.length;

        if (total === 0) {
            toast("Your collection is already empty", "info");
            return;
        }

        const plural = total === 1 ? "1 record" : total + " records";

        ask({
            title: "Delete your entire collection?",
            text: "You are about to remove " + plural + " from your collection.",
            confirm: "Yes, continue"
        }).then(function (first) {
            if (!first) return;

            return ask({
                title: "Are you absolutely sure?",
                text: "Every record and its songs will be deleted for good. This cannot be undone.",
                confirm: "Yes, delete everything",
                danger: true
            }).then(function (second) {
                if (!second) return;

                wipeCollection();

                if (window.Swal) {
                    Swal.fire("Deleted", "Your collection is now empty.", "success");
                }
            });
        });
    });

    // ---------- La tarjeta baja lo que mida el panel (solo se nota en escritorio) ----------

    const menuTopEl = document.getElementById("menuTop");

    // Con el panel abierto la página no se puede desplazar
    function lockPageScroll(lock) {
        const root = document.documentElement;

        if (lock) {
            // Si había barra de scroll, se reserva su espacio para que nada se mueva al ocultarla
            if (window.innerWidth > root.clientWidth) root.style.scrollbarGutter = "stable";
            root.classList.add("settings-open");
        } else {
            root.classList.remove("settings-open");
            root.style.scrollbarGutter = "";
        }
    }

    new MutationObserver(function () {
        const isOpen = menuTopEl.classList.contains("active");

        if (isOpen) {
            // Los botones de abajo (incluido el de ajustes) siempre deben quedar a la vista:
            // 1) si están fuera de la ventana, se baja la página hasta mostrarlos
            const appBottom = appCard.offsetTop + appCard.offsetHeight;
            if (appBottom + 16 > window.scrollY + window.innerHeight) {
                window.scrollTo(0, Math.max(0, appBottom + 16 - window.innerHeight));
            }

            // 2) la tarjeta baja lo que mida el panel, pero solo hasta donde hay espacio libre
            const room = window.scrollY + window.innerHeight - appBottom - 16;
            const shift = Math.max(0, Math.min(menuTopEl.offsetHeight + 16, room));
            appCard.style.setProperty("--shift", shift + "px");
        } else if (pendingTheme !== settings.theme) {
            // Se cerró el panel sin guardar: vuelve el tema guardado
            pendingTheme = settings.theme;
            applyTheme(pendingTheme);
            renderThemeUI();
        }

        lockPageScroll(isOpen);   // se bloquea después de dejar los botones a la vista
    }).observe(menuTopEl, { attributes: true, attributeFilter: ["class"] });

    // Escape también cierra el panel
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && menuTopEl.classList.contains("active")) {
            document.getElementById("seting").click();
        }
    });

    // ---------- Tocadiscos de cada tema ----------
    // El CSS elige la imagen con la variable --turntable de cada tema. Se precargan todas
    // para que al cambiar de tema (vista previa) no haya parpadeo.
    ["text_1", "txt_36", "txt_37", "txt_38"].forEach(function (name) {
        new Image().src = "images/" + name + ".png";
    });

    // ---------- Estado inicial ----------

    applyTheme(settings.theme);
    renderThemeUI();
    renderVolume(settings.volume);
    setVolume(settings.volume);
    syncPlaybackOptions();
    renderPlaybackToggles();

})();