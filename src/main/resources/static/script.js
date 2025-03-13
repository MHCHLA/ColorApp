// color conversion util
function rgbToLab(r, g, b) {
    let R = r / 255, G = g / 255, B = b / 255;
    [R, G, B] = [R, G, B].map(v =>
        (v <= 0.04045) ? (v / 12.92) : Math.pow((v + 0.055) / 1.055, 2.4)
    );
    let X = R * 0.4124 + G * 0.3576 + B * 0.1805;
    let Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
    let Z = R * 0.0193 + G * 0.1192 + B * 0.9505;
    const refX = 0.95047, refY = 1.00000, refZ = 1.08883;
    X /= refX; Y /= refY; Z /= refZ;
    [X, Y, Z] = [X, Y, Z].map(v =>
        (v > 0.008856) ? Math.pow(v, 1/3) : (7.787 * v + 16/116)
    );
    const L = (116 * Y) - 16;
    const a = 500 * (X - Y);
    const b_ = 200 * (Y - Z);
    return { L, a, b: b_ };
}

function labToRgb(L, a, b) {
    let y = (L + 16) / 116;
    let x = a / 500 + y;
    let z = y - b / 200;
    const refX = 0.95047, refY = 1.00000, refZ = 1.08883;
    let X = Math.pow(x, 3) > 0.008856 ? Math.pow(x, 3) : (x - 16/116) / 7.787;
    let Y = Math.pow(y, 3) > 0.008856 ? Math.pow(y, 3) : (y - 16/116) / 7.787;
    let Z = Math.pow(z, 3) > 0.008856 ? Math.pow(z, 3) : (z - 16/116) / 7.787;
    X *= refX; Y *= refY; Z *= refZ;
    let R = X *  3.2406 + Y * -1.5372 + Z * -0.4986;
    let G = X * -0.9689 + Y *  1.8758 + Z *  0.0415;
    let B = X *  0.0557 + Y * -0.2040 + Z *  1.0570;
    [R, G, B] = [R, G, B].map(v =>
        (v > 0.0031308)
            ? (1.055 * Math.pow(v, 1/2.4) - 0.055)
            : (12.92 * v)
    );
    R = Math.min(Math.max(0, R), 1) * 255;
    G = Math.min(Math.max(0, G), 1) * 255;
    B = Math.min(Math.max(0, B), 1) * 255;
    return { r: Math.round(R), g: Math.round(G), b: Math.round(B) };
}

// hue/sat/lightness adjustments
function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = (l > 0.5) ? d / (2 - max - min) : d / (max + min);
        if (max === r) {
            h = (g - b) / d + (g < b ? 6 : 0);
        } else if (max === g) {
            h = (b - r) / d + 2;
        } else {
            h = (r - g) / d + 4;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }
        let q = (l < 0.5) ? (l * (1 + s)) : (l + s - l * s);
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

// draggable panel
function makeDraggable(element, handle) {
    let offsetX = 0, offsetY = 0, isDown = false;
    handle.addEventListener('mousedown', function(e) {
        isDown = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    });
    function mouseMoveHandler(e) {
        if (!isDown) return;
        element.style.left = (e.clientX - offsetX) + 'px';
        element.style.top = (e.clientY - offsetY) + 'px';
    }
    function mouseUpHandler(e) {
        isDown = false;
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
    const imageInput = document.getElementById("imageInput");
    const imageCanvas = document.getElementById("imageCanvas");
    const uploadOverlay = document.getElementById("uploadOverlay");
    const removeImageBtn = document.getElementById("removeImageBtn");
    const filterButton = document.getElementById("filterButton");
    const filterContent = document.getElementById("filterContent");
    const brandsListDiv = document.getElementById("brandsList");
    const seriesListDiv = document.getElementById("seriesList");
    const selectedColorsDiv = document.getElementById("selectedColors");
    const matchResultsDiv = document.getElementById("matchResults");

    // advanced panel
    const advancedPanel = document.getElementById("advancedPanel");
    const advancedHeader = document.getElementById("advancedHeader");
    const advancedCloseBtn = document.getElementById("advancedCloseBtn");
    const hueSlider = document.getElementById("hueSlider");
    const saturationSlider = document.getElementById("saturationSlider");
    const lightnessSlider = document.getElementById("lightnessSlider");
    const hueValueSpan = document.getElementById("hueValue");
    const saturationValueSpan = document.getElementById("saturationValue");
    const lightnessValueSpan = document.getElementById("lightnessValue");
    const advancedColorPreview = document.getElementById("advancedColorPreview");
    const advancedApplyBtn = document.getElementById("advancedApplyBtn");
    const advancedCancelBtn = document.getElementById("advancedCancelBtn");

    let ctx = imageCanvas.getContext("2d");
    let currentImage = new Image();
    let imageLoaded = false;
    const maxImageHeight = 680;

    // advanced panel
    let currentEditBox = null; // the .color-box element being edited
    let baseColor = null;      // {r, g, b}

    // toggle filter
    filterButton.addEventListener("click", () => {
        if (filterContent.style.display === "none" || filterContent.style.display === "") {
            filterContent.style.display = "block";
        } else {
            filterContent.style.display = "none";
        }
    });

    // collapsibles
    document.querySelectorAll(".collapsible").forEach(col => {
        const header = col.querySelector(".collapsible-header");
        const arrowSpan = header.querySelector(".arrow");
        header.addEventListener("click", () => {
            col.classList.toggle("open");
            arrowSpan.textContent = col.classList.contains("open") ? "▲" : "▼";
        });
    });

    // load filter data from backend
    function loadBrands() {
        fetch("/api/manufacturers")
            .then(res => res.json())
            .then(brands => {
                brandsListDiv.innerHTML = "";
                if (!brands || brands.length === 0) return;
                brands.forEach(brand => {
                    const label = document.createElement("label");
                    label.style.display = "block";
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.name = "brandCheckbox";
                    checkbox.value = brand;
                    label.appendChild(checkbox);
                    label.appendChild(document.createTextNode(" " + brand));
                    brandsListDiv.appendChild(label);
                });
            })
            .catch(err => console.error(err));
    }

    function loadSeries() {
        fetch("/api/series")
            .then(res => res.json())
            .then(seriesArr => {
                seriesListDiv.innerHTML = "";
                if (!seriesArr || seriesArr.length === 0) return;
                seriesArr.forEach(ser => {
                    const label = document.createElement("label");
                    label.style.display = "block";
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.name = "seriesCheckbox";
                    checkbox.value = ser;
                    label.appendChild(checkbox);
                    label.appendChild(document.createTextNode(" " + ser));
                    seriesListDiv.appendChild(label);
                });
            })
            .catch(err => console.error(err));
    }

    loadBrands();
    loadSeries();

    function getSelectedBrands() {
        const checked = brandsListDiv.querySelectorAll("input[name='brandCheckbox']:checked");
        return Array.from(checked).map(cb => cb.value);
    }

    function getSelectedSeries() {
        const checked = seriesListDiv.querySelectorAll("input[name='seriesCheckbox']:checked");
        return Array.from(checked).map(cb => cb.value);
    }

    // img upload / removal
    uploadOverlay.addEventListener("click", () => {
        imageInput.click();
    });

    removeImageBtn.addEventListener("click", () => {
        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
        imageLoaded = false;
        removeImageBtn.style.display = "none";
        uploadOverlay.style.display = "flex";
    });

    imageCanvas.addEventListener("click", (e) => {
        if (!imageLoaded) {
            imageInput.click();
        } else {
            pickColor(e);
        }
    });

    imageInput.addEventListener("change", handleFile);

    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            currentImage.onload = () => {
                let scale = 1;
                if (currentImage.height > maxImageHeight) {
                    scale = maxImageHeight / currentImage.height;
                }
                imageCanvas.height = currentImage.height * scale;
                imageCanvas.width = currentImage.width * scale;
                ctx.drawImage(currentImage, 0, 0, imageCanvas.width, imageCanvas.height);
                imageLoaded = true;
                uploadOverlay.style.display = "none";
                removeImageBtn.style.display = "block";
            };
            currentImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function pickColor(e) {
        const rect = imageCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const [r, g, b] = pixel;
        addSelectedColor(r, g, b);
    }

    function addSelectedColor(r, g, b) {
        const item = document.createElement("div");
        item.className = "selected-color-item";

        const box = document.createElement("div");
        box.className = "color-box";
        box.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        box.dataset.baseColor = JSON.stringify({ r, g, b });

        const removeBtn = document.createElement("span");
        removeBtn.className = "remove-btn";
        removeBtn.textContent = "×";
        removeBtn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            selectedColorsDiv.removeChild(item);
        });

        const advancedBtn = document.createElement("button");
        advancedBtn.className = "advanced-btn";
        advancedBtn.textContent = "Adj";
        advancedBtn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            openAdvancedPanel(box);
        });

        // Clicking the swatch queries the backend with the current color
        item.addEventListener("click", (ev) => {
            ev.stopPropagation();
            const currentColor = JSON.parse(box.dataset.baseColor);
            const lab = rgbToLab(currentColor.r, currentColor.g, currentColor.b);
            queryClosestColors(lab);
        });

        item.appendChild(box);
        item.appendChild(removeBtn);
        item.appendChild(advancedBtn);
        selectedColorsDiv.appendChild(item);
    }

    // cursor
    imageCanvas.addEventListener("mousemove", (e) => {
        if (!imageLoaded) {
            imageCanvas.style.cursor = "default";
            return;
        }
        const rect = imageCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const [r, g, b] = pixel;
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        const crossColor = (brightness < 128) ? "#fff" : "#000";

        const c = document.createElement("canvas");
        c.width = 32;
        c.height = 32;
        const cctx = c.getContext("2d");
        cctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        cctx.fillRect(0, 0, 32, 32);
        cctx.strokeStyle = crossColor;
        cctx.lineWidth = 2;
        cctx.strokeRect(0, 0, 32, 32);
        cctx.beginPath();
        cctx.moveTo(16, 6);
        cctx.lineTo(16, 26);
        cctx.moveTo(6, 16);
        cctx.lineTo(26, 16);
        cctx.stroke();

        const dataURL = c.toDataURL("image/png");
        imageCanvas.style.cursor = `url(${dataURL}) 16 16, auto`;
    });

    imageCanvas.addEventListener("mouseleave", () => {
        imageCanvas.style.cursor = "default";
    });

    // advanced panel
    function openAdvancedPanel(box) {
        currentEditBox = box;
        baseColor = JSON.parse(box.dataset.baseColor);
        // Reset sliders
        hueSlider.value = 0;
        saturationSlider.value = 0;
        lightnessSlider.value = 0;
        hueValueSpan.textContent = "0";
        saturationValueSpan.textContent = "0";
        lightnessValueSpan.textContent = "0";

        advancedColorPreview.style.backgroundColor = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
        advancedPanel.style.display = "block";
    }

    function closeAdvancedPanel() {
        advancedPanel.style.display = "none";
    }

    function updateAdvancedPreview() {
        let { r, g, b } = baseColor;
        let [h, s, l] = rgbToHsl(r, g, b);
        let hueAdj = parseFloat(hueSlider.value);
        let satAdj = parseFloat(saturationSlider.value);
        let lightAdj = parseFloat(lightnessSlider.value);

        h = (h + hueAdj) % 360; if (h < 0) h += 360;
        s = Math.min(100, Math.max(0, s + satAdj));
        l = Math.min(100, Math.max(0, l + lightAdj));

        let newRgb = hslToRgb(h, s, l);
        advancedColorPreview.style.backgroundColor = `rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`;
    }

    hueSlider.addEventListener("input", () => {
        hueValueSpan.textContent = hueSlider.value;
        updateAdvancedPreview();
    });

    saturationSlider.addEventListener("input", () => {
        saturationValueSpan.textContent = saturationSlider.value;
        updateAdvancedPreview();
    });

    lightnessSlider.addEventListener("input", () => {
        lightnessValueSpan.textContent = lightnessSlider.value;
        updateAdvancedPreview();
    });

    advancedApplyBtn.addEventListener("click", () => {
        let newColor = advancedColorPreview.style.backgroundColor;
        if (newColor) {
            currentEditBox.style.backgroundColor = newColor;
            let rgbVals = newColor.match(/\d+/g).map(Number);
            currentEditBox.dataset.baseColor = JSON.stringify({ r: rgbVals[0], g: rgbVals[1], b: rgbVals[2] });
        }
        closeAdvancedPanel();
    });

    advancedCancelBtn.addEventListener("click", () => {
        closeAdvancedPanel();
    });

    advancedCloseBtn.addEventListener("click", () => {
        closeAdvancedPanel();
    });

    makeDraggable(advancedPanel, advancedHeader);

    // query closest colors from backend
    function queryClosestColors(lab) {
        const brands = getSelectedBrands();
        const series = getSelectedSeries();
        const payload = {
            l: lab.L,
            a: lab.a,
            b: lab.b,
            manufacturers: brands,
            series: series
        };
        console.log("Query Payload:", payload);
        fetch("/api/closest-colors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                matchResultsDiv.innerHTML = "";
                data.forEach(item => {
                    const div = document.createElement("div");
                    div.className = "match-item";

                    const colorBox = document.createElement("div");
                    colorBox.className = "match-color-box";
                    const approxRgb = labToRgb(item.l, item.a, item.b);
                    colorBox.style.backgroundColor = `rgb(${approxRgb.r}, ${approxRgb.g}, ${approxRgb.b})`;

                    const info = document.createElement("div");
                    info.innerHTML = `
          <strong>${item.manufacturer} - ${item.series}</strong><br>
          Paint#: ${item.paintNumber}<br>
          Name: ${item.paintName}<br>
          ΔE: ${item.deltaE.toFixed(2)}
        `;
                    div.appendChild(colorBox);
                    div.appendChild(info);
                    matchResultsDiv.appendChild(div);
                });
            })
            .catch(err => console.error(err));
    }
});
