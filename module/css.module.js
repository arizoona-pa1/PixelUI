export const PixelUI = {
  brightnessAdjustment: {
    50: "98%",
    100: "96%",
    200: "90%",
    300: "83%",
    400: "64%",
    500: "45%",
    600: "32%",
    700: "25%",
    800: "15%",
    900: "11%",
    950: "5%",
  },
  sheet: new CSSStyleSheet(),
  memory: new Map(),
  localStorage: new Map([
    ["lightColor", "black"],
    ["darkColor", "white"],
    ["cssShortCut", {}],
    ["colorHSL", {}],
    ["content", ""],
  ]),
  getLuminance: function (color) {
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;

    // Calculate luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },

  hexToHslWithOpacity: function (hex) {
    // Remove # if present
    hex = hex.replace("#", "");

    // Parse hex values (support 3, 6, and 8 character formats)
    let r,
      g,
      b,
      a = 1;

    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
      a = parseInt(hex.substring(6, 8), 16) / 255;
    } else {
      throw new Error("Invalid HEX color format");
    }

    // Convert RGB to HSL
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return {
      hsl: [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)],
      opacity: a.toFixed(2),
    };
  },
  rgbToHslWithOpacity: function (rgbStr) {
    // Extract values from string like "rgb(255, 0, 0)" or "rgba(255, 0, 0, 0.5)"
    const match = rgbStr.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i
    );
    if (!match) throw new Error("Invalid RGB/RGBA color format");

    let r = parseInt(match[1]);
    let g = parseInt(match[2]);
    let b = parseInt(match[3]);
    let a = match[4] ? parseFloat(match[4]) : 1;

    // Convert RGB to HSL
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return {
      hsl: [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)],
      opacity: a.toFixed(2),
    };
  },
  hslaToHslWithOpacity: function (hslaStr) {
    // Extract values from string like "hsl(120, 50%, 50%)" or "hsla(120, 50%, 50%, 0.5)"
    const match = hslaStr.match(
      /hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*([\d.]+))?\)/i
    );
    if (!match) throw new Error("Invalid HSL/HSLA color format");

    const h = parseInt(match[1]);
    const s = parseFloat(match[2]);
    const l = parseFloat(match[3]);
    const a = match[4] ? parseFloat(match[4]) : 1;

    return {
      hsl: [h, s, l],
      opacity: a.toFixed(2),
    };
  },
  computeTextColor: function (el) {
    const bgColor = window.getComputedStyle(el).backgroundColor;
    const rgb = bgColor.match(/\d+/g); // Extract RGB values
    if (rgb == null || rgb == undefined) return;
    const luminance = this.getLuminance(
      `#${rgb.map((c) => parseInt(c).toString(16).padStart(2, "0")).join("")}`
    );
    const color =
      luminance > 0.5
        ? this.localStorage.get("lightColor")
        : this.localStorage.get("darkColor");
    el.style.color = color;
    el.style.setProperty("--color-coding", color);
  },
  transformHSL: function (colour) {
    // Get the parent element (or document.body if not specified)
    // hsl, rgb, hex;
    // Determine the input type and convert it to HSL
    if (colour.startsWith("hsl")) {
      // Extract HSL values from the input
      return this.hexToHslWithOpacity(colour);
    } else if (colour.startsWith("rgb")) {
      // Convert RGB to HSL
      return this.rgbToHslWithOpacity(colour);
    } else if (colour.startsWith("#")) {
      // Convert HEX to HSL
      return this.hexToHslWithOpacity(colour);
    } else {
      console.error("Invalid color format. Use HSL, RGB, or HEX.");
      return;
    }

    // Add quality to the HSL lightness value
    // const hslValues = hsl.match(/\d+/g).map(Number);
    // const adjustedLightness = Math.min(
    //   100,
    //   Math.max(0, hslValues[2] * quality)
    // );
    // hsl = `${hslValues[0]}, ${hslValues[1]}%, ${adjustedLightness}%`;

    // Set CSS custom properties
  },

  parseCSSClass: function (property) {
    const replace = function (v) {
      return v.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    };

    let [propertyName, nameElement, pseudo] = property.split("_");

    if (this.localStorage.get("cssShortCut").hasOwnProperty(propertyName)) {
      propertyName = this.localStorage.get("cssShortCut")[propertyName];
    }

    let cssVariable =
      `--${replace(propertyName)}-coding` +
      (nameElement ? `-${replace(nameElement)}` : "") +
      (pseudo ? `-${replace(pseudo)}` : "");

    return {
      cssVariable: cssVariable,
      propertyName: propertyName,
    };
  },
  autoTextColor: function (el) {
    setTimeout(function () {
      this.computeTextColor(el);
    }, 0);
  },
  setBuildColor: function (String) {
    // get value from dataset
    let hsl;
    if (String.startsWith("@")) {
      nameProperty = String.replace(/@/g, "");
      let [nameProperty, quality = 0, opacity = 1] = String.split(/[_ ,]+/);
      if (this.localStorage.get("colorHSL").hasOwnProperty(nameProperty))
        hsl = this.localStorage.get("colorHSL")[nameProperty];
      opacity =
        Number(opacity) > 1 ? 1 : Number(opacity) < 0 ? 0.1 : Number(opacity);
      quality = this.brightnessAdjustment[quality] || "55%";

      hsl = `${hsl}, ${quality}`;
    } else {
      ({ hsl, opacity } = this.transformColorHSL(String));
    }

    parentElement.style.setProperty("--hsl-color-coding-build", hsl);
    parentElement.style.setProperty("--opacity-coding-build", opacity);
  },
  CSSClass: function (className) {
    if (className.indexOf(":") == -1) return; //Skip
    if (this.memory.has(className) == true) return; //Skip
    this.memory.set(className, true);
    let [name, value] = className.split(":");
    // if (name.indexOf("@") != -1) return; //Skip

    let { cssVariable, propertyName, nameElement, pseudo } =
      this.parseCSSClass(name);

    // replace value
    this.localStorage.set(
      "content",
      this.localStorage.get("content") +
        `
        .${className.replace(/[:@.#%]/g, "\\$&")}{
            ${propertyName}:${value.replace(/[_]/g, " ")};
            ${cssVariable}:${value.replace(/[_]/g, " ")} !important;
        }
    `
    );
    if (supportsConstructableStylesheets)
      return this.sheet.replace(this.localStorage.get("content"));
    // check is exist on cssShortCut
    if (this.localStorage.has("style")) {
      const style = document.createElement("style");
      document.head.appendChild(style);
      this.localStorage.set("style", style);
    }
    this.localStorage.get("style").innerHTML = content;

    // spelit - dash values
  },
};
PixelUI.localStorage.set(
  "cssShortCut",
  getJsonFile(scriptUrl + `/json/shortcut.css.config.json`)
);
PixelUI.localStorage.set(
  "colorHSL",
  getJsonFile(scriptUrl + `/json/hsl-color.css.config.json`)
);
// Your custom function
