export function extractPalette(image) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const set = new Set();

    for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a === 0) continue; // ignore transparent
        set.add(`${data[i]},${data[i+1]},${data[i+2]}`);
    }
    return [...set]; // palette array
}

export function buildSingleColorMap(sourceRGB, targetRGB) {
    // sourceRGB = [r,g,b]
    // targetRGB = [nr,ng,nb]
    const key = `${sourceRGB[0]},${sourceRGB[1]},${sourceRGB[2]}`;
    const map = new Map();
    map.set(key, targetRGB);
    return map;
}


export function buildPaletteMap(originalPalette, targetPalette) {
    const map = new Map();
    for (let i = 0; i < originalPalette.length; i++) {
        // if palette lengths mismatch, safely clamp
        const [r, g, b] = originalPalette[i].split(",").map(Number);
        const [nr, ng, nb] = targetPalette[Math.min(i, targetPalette.length - 1)];
        map.set(`${r},${g},${b}`, [nr, ng, nb]);
    }
    return map;
}

function isCloseColor(r, g, b, target, tolerance) {
    return (
        Math.abs(r - target[0]) <= tolerance &&
        Math.abs(g - target[1]) <= tolerance &&
        Math.abs(b - target[2]) <= tolerance
    );
}




export function paletteSwap(image, colorMap, tolerance = 3) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3];
        if (a === 0) continue;

        for (const [key, newColor] of colorMap.entries()) {
            const [tr, tg, tb] = key.split(",").map(Number);

            if (isCloseColor(pixels[i], pixels[i+1], pixels[i+2], [tr, tg, tb], tolerance)) {
                pixels[i]     = newColor[0];
                pixels[i + 1] = newColor[1];
                pixels[i + 2] = newColor[2];
            }
        }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
}

function isNearWhite(r, g, b, threshold = 200) {
    return r >= threshold && g >= threshold && b >= threshold;
}

export function paletteSwapSmart(image, palette) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    // Buckets: light (skin), mid (clothes), dark (shadows)
    const groups = {
        light: null,
        mid: null,
        dark: null
    };

    function brightness(r, g, b) {
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }

    // Assign each group one new color (from supplied palette)
    const groupKeys = Object.keys(groups);
    let paletteIndex = 0;

    for (let key of groupKeys) {
        groups[key] = palette[paletteIndex % palette.length];
        paletteIndex++;
    }

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a === 0) continue;

        const br = brightness(r, g, b);

        let chosenColor;

        if (br > 180) chosenColor = groups.light;     // skin / light clothes
        else if (br > 80) chosenColor = groups.mid;   // main clothing
        else chosenColor = groups.dark;               // shadows / hair outlines

        pixels[i]     = chosenColor[0];
        pixels[i + 1] = chosenColor[1];
        pixels[i + 2] = chosenColor[2];
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
}


export function paletteSwapAllColors(image) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    // Map originalColorHex → newColorRGB
    const colorMap = new Map();

    // Helper to convert RGB to hex key
    const toKey = (r, g, b) => `${r},${g},${b}`;

    // Helper to generate a new color different from the original
    function generateDifferentColor(r, g, b) {
        let newR, newG, newB;
        do {
            newR = Math.floor(Math.random() * 256);
            newG = Math.floor(Math.random() * 256);
            newB = Math.floor(Math.random() * 256);
        } while (
            Math.abs(newR - r) < 20 &&
            Math.abs(newG - g) < 20 &&
            Math.abs(newB - b) < 20
        );
        return [newR, newG, newB];
    }

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a === 0) continue; // Skip transparent pixels

        const key = toKey(r, g, b);

        // If this color wasn't processed before, create a new mapped color
        if (!colorMap.has(key)) {
            colorMap.set(key, generateDifferentColor(r, g, b));
        }

        const [nr, ng, nb] = colorMap.get(key);

        pixels[i]     = nr;
        pixels[i + 1] = ng;
        pixels[i + 2] = nb;
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
}



export function invertSprite(image) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3];
        if (a === 0) continue;

        // invert colors
        pixels[i]     = 255 - pixels[i];     // R
        pixels[i + 1] = 255 - pixels[i + 1]; // G
        pixels[i + 2] = 255 - pixels[i + 2]; // B
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
}

export function hueShiftSprite(image, hueShiftDegrees, saturationFactor = 1.0, lightnessFactor = 1.0) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3];
        if (a === 0) continue;

        let r = pixels[i] / 255;
        let g = pixels[i + 1] / 255;
        let b = pixels[i + 2] / 255;

        // convert to HSL
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = 0; s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        // ======================
        //   REAL KOF STYLE SHIFT
        // ======================

        // shift hue
        h = (h + hueShiftDegrees / 360) % 1;

        // boost or reduce saturation (real palette swap behavior)
        s = Math.min(1, Math.max(0, s * saturationFactor));

        // adjust brightness for dramatic recolor
        l = Math.min(1, Math.max(0, l * lightnessFactor));

        // convert back to RGB
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        let r2, g2, b2;

        if (s === 0) {
            r2 = g2 = b2 = l; // grayscale
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r2 = hue2rgb(p, q, h + 1/3);
            g2 = hue2rgb(p, q, h);
            b2 = hue2rgb(p, q, h - 1/3);
        }

        pixels[i]     = Math.round(r2 * 255);
        pixels[i + 1] = Math.round(g2 * 255);
        pixels[i + 2] = Math.round(b2 * 255);
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
}


export function paletteSwapFinal(image, newPalette) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    // --- Step 1: Collect all unique original colors ---
    const uniqueColors = [];

    function addUniqueColor(r, g, b) {
        const key = (r << 16) | (g << 8) | b;
        if (!uniqueColors.includes(key)) {
            uniqueColors.push(key);
        }
    }

    for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3];
        if (a === 0) continue;

        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        addUniqueColor(r, g, b);
    }

    // --- Step 2: Sort palette by brightness to group skin, clothes, shadows, etc. ---
    function brightness(rgb) {
        const r = (rgb >> 16) & 255;
        const g = (rgb >> 8) & 255;
        const b = rgb & 255;
        return 0.299*r + 0.587*g + 0.114*b;
    }

    uniqueColors.sort((a, b) => brightness(a) - brightness(b));

    // --- Step 3: Build color-mapping lookup ---
    const colorMap = {};

    for (let i = 0; i < uniqueColors.length; i++) {
        const original = uniqueColors[i];
        const mapped = newPalette[i % newPalette.length]; // loop colors if fewer provided

        colorMap[original] = mapped;
    }

    // --- Step 4: Apply palette swap ---
    for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3];
        if (a === 0) continue;

        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        const key = (r << 16) | (g << 8) | b;

        const mapped = colorMap[key];
        if (mapped) {
            pixels[i]     = mapped[0];
            pixels[i + 1] = mapped[1];
            pixels[i + 2] = mapped[2];
        }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
}








