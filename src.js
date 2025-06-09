// Combined JavaScript modules 
// Generated on Sun 06/08/2025 22:59:08.61 
 
 
// --- Source: 0.aria-selected.js --- 
 
class PixelSelectElement {
  constructor(
    Elements,
    activeElement = undefined,
    multiple = false,
    toggle = false
  ) {
    if (!Array.isArray(Elements)) {
      console.error(`Elements on class ${this.constructor.name} is not Array.`);
    }

    for (let el of Elements) {
      el.addEventListener("click", (e) => {
        if (
          (activeElement && !Boolean(multiple) && !Boolean(toggle)) ||
          (Boolean(toggle) && activeElement != el)
        )
          this.deselect(activeElement);

        toggle ? this.toggle(el) : this.select(el);
        activeElement = el;
      });
    }
    if (activeElement) {
      setTimeout(() => {
        activeElement.dispatchEvent(
          new PointerEvent("click", { bubbles: true, cancelable: true })
        );
      }, 0);
    }
  }
  select(el) {
    el.ariaSelected = "true";
  }
  deselect(el) {
    el.ariaSelected = "false";
  }
  toggle(el) {
    !Boolean(el.ariaSelected) ? this.select(el) : this.deselect(el);
  }
}
 
 
// --- Source: 0.code.js --- 
 
 
 
// --- Source: 1.pixelHTML.js --- 
 
class PixelHTML extends HTMLElement {
  constructor() {
    super();
  }
  async loadStyles(styleNames, shadowRoot) {
    const names = Array.isArray(styleNames) ? styleNames : [styleNames];

    // Load all sheets in parallel
    const sheets = await Promise.all(
      names.map((name) => this.loadStyleSheet(name))
    );

    // Merge with existing sheets (don't overwrite)
    if (!supportsConstructableStylesheets) {
      for (let sheet of sheets) shadowRoot.append(sheet);
      return;
    }
    if (shadowRoot) {
      shadowRoot.adoptedStyleSheets = [
        ...(shadowRoot.adoptedStyleSheets || []),
        ...sheets,
      ];
    } else {
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, ...sheets];
    }
  }
  async loadStyleSheet(name) {
    const url = scriptUrl + `/widgets/styles/${name}.css`;
    // Return cached sheet if available
    if (styleSheetCache.has(url)) {
      return styleSheetCache.get(url);
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const sheet = new CSSStyleSheet();
      styleSheetCache.set(url, sheet);

      const cssText = await response.text();
      if (!supportsConstructableStylesheets) {
        const style = document.createElement("style");
        style.innerHTML = cssText;
        return style;
      }
      sheet.replaceSync(cssText);
      return sheet;
    } catch (error) {
      console.error(`Failed to load style ${url}:`, error);
      // Return empty stylesheet as fallback
      return new CSSStyleSheet();
    }
  }
  addEventListenerFilled(...slotBindEvent) {
    for (let slot of slotBindEvent) {
      slot.addEventListener("slotchange", () => {
        const assignedNodes = slot.assignedNodes();
        const hasContent = assignedNodes.length > 0;
        slot.classList.toggle("filled", hasContent);
      });
    }
  }
  directionSlot(node, ...args) {
    for (let arg of args) {
      const els = node.querySelectorAll(`[slot="${arg}"]`);
      if (!els) continue;
      for (let el of els) {
        if (el.hasAttribute("dir")) continue;
        el.setAttribute("dir", "left");
      }
    }
    node.querySelectorAll("[dir]")?.forEach((el) => {
      if (!el.hasAttribute("slot")) return;
      const newName = el
        .getAttribute("slot")
        .concat("-")
        .concat(
          el.getAttribute("dir").toLowerCase() == "right" ? "right" : "left"
        );
      el.setAttribute("slot", newName);
    });
  }
}
 
 
// --- Source: 2.dialog.js --- 
 
class PixelDialog extends PixelHTML {
  constructor() {
    super();
    this._open = true;
    this.screenBtnClose = undefined;
    this.modal = undefined;
    this.buttonsEventBound = new Set();
    this.screenBtnClose = document.createElement("div");
    this.screenBtnClose.classList.add("pixel");
    this.screenBtnClose.classList.add("backdrop");

    this.screenBtnClose.addEventListener("click", (e) => {
      if (e.currentTarget !== e.target) return;
      this.close();
    });
  }
  open() {
    if (this._open) return;
    this._open = true;
    // -------------------
    // create backDrop on body
    // document.body.prepend(this.screenBtnClose);
    document.body.classList.add("overflow-hidden");
    // -------------------
    if (this.modal) {
      this.modal.hidden = false;
      this.modal.classList.remove("display-none");
    }
  }
  close() {
    if (!this._open) return;
    this._open = false;
    // ------------------
    // if (document.body.contains(this.screenBtnClose)) {
    //   document.body.removeChild(this.screenBtnClose);
    // }
    document.body.classList?.remove("overflow-hidden");
    if (this.modal) {
      this.modal.hidden = true;
      this.modal.classList.add("display-none");
    }
  }
  toggle() {
    !this._open ? this.open() : this.close();
  }
  bindBtns(button) {
    const name = button?.getAttribute("button");
    const handler = this[name];
    if (handler)
      button?.addEventListener("click", (e) => {
        e.preventDefault();
        handler.call(this);
      });
      button?.addEventListener("hover", (e) => {
        e.preventDefault();
        handler.call(this);
      });
  }
}
class PixelModal extends PixelDialog {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const template = document.createElement("div");
    template.classList.add("template");
    template.classList.add("modal");

    this.container = template;

    this.contentSlot = document.createElement("slot");
    // contentSlot.setAttribute('name','content');

    template.appendChild(this.contentSlot);
  }
  async connectedCallback() {
    try {
      await this.loadStyles(["public", "components/_modal"], this.shadowRoot);
    } catch (err) {
      console.error(`Failed to load styles for ${this.constructor.name}:`, err);
    }
    this.render();
  }

  render() {
    // Clear shadow root and append container
    this.shadowRoot.innerHTML = "";
    this.screenBtnClose.appendChild(this.container);
    this.shadowRoot.appendChild(this.screenBtnClose);
    this.modal = this;
    this.close();

    const direction = this.getAttribute("dir");
    const id = this.getAttribute("id");
    if (direction) this.screenBtnClose.classList.add(direction);
    const els = document.body.querySelectorAll(`[target="${id}"][button]`);
    for (let el of els) {
      this.bindBtns(el);
    }

    // auto Select Button in modal
    for (let el of this.querySelectorAll("[button]")) {
      let a = el.closest("p-dropdown,p-modal");

      if (a.tagName == "p-dropdown" || el.hasAttribute("target")) continue;
      if (a === this && !this.buttonsEventBound.has(el)) {
        this.bindBtns(el);
        this.buttonsEventBound.add(el);
      }
    }
  }
}
customElements.define("p-modal", PixelModal);

class Modal {
  constructor(obj) {
    if (Object.isEmpty(options)) return false;
    const el = document.createElement("p-modal");

    appendElement(el, obj);
  }
}
 
 
// --- Source: 99.observer.js --- 
 
// Extract
const PixelUI = {
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
    console.log(propertyName);

    if (this.localStorage.get("cssShortCut").hasOwnProperty(propertyName)) {
      propertyName = this.localStorage.get("cssShortCut")[propertyName];
      console.log(propertyName);
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
    console.log(name, value);
    let { cssVariable, propertyName } = this.parseCSSClass(name);

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
    console.log(this.localStorage.get("content"));

    // if (supportsConstructableStylesheets) {
    //   this.sheet.replace(this.localStorage.get("content"));
    //   if (this.memory.has("appendCSSStyleSheet")) {
    //     document.body.appendChild(this.sheet);
    //     this.memory.set("appendCSSStyleSheet", true);
    //   }
    //   return;
    // }
    // check is exist on cssShortCut
    if (!this.localStorage.has("style")) {
      const style = document.createElement("style");
      document.head.appendChild(style);
      this.localStorage.set("style", style);
    }

    this.localStorage.get("style").innerHTML = this.localStorage.get("content");

    // spelit - dash values
  },
};
PixelUI.localStorage.set("cssShortCut", {
  h: "height",
  w: "width",
  bgColor: "background-color",
  bgc: "background-color",
  bg: "background",
  c: "color",
  b: "border",
  br: "border-radius",
  bc: "border-color",
  bw: "border-width",
  bs: "border-style",
  olo: "outline-offset",
  olc: "outline-color",
  olw: "outline-width",
  ols: "outline-style",
  bxs: "box-shadow",
  fv: "font-variant",
  fs: "font-size",
});
// getJsonFile(scriptUrl + `/json/hsl-color.css.config.json`)
PixelUI.localStorage.set("colorHSL", {
  black: "0, 0%",
  empty: "0, 0%",
  info: "231, 59%",
  success: "146, 79%",
  warning: "37, 91%",
  danger: "353, 81%",
});
// Your custom function

const observer = new MutationObserver((mutations) => {
  console.log(mutations);
  for (let mutation of mutations) {
    console.log(mutation.addedNodes);

    if (mutation.type === "attributes") {
      const target = mutation.target;
      const attrName = mutation.attributeName;
      const newValue = target.getAttribute(attrName);
      console.log(attrName);
      switch (attrName) {
        case "class":
          PixelUI.CSSClass(newValue);
          console.log("class Observer ");
          break;
        case "data-build-color":
        case "data-bc":
          PixelUI.setBuildColor(newValue);
          console.log("buider color Observer ");

          break;
        case "data-atc":
          PixelUI.autoTextColor(target);
          console.log("auto text color Observer ");

          break;
      }
    }
  }
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class", "data-build-color", "data-bc", "data-atc"],
  subtree: true,
});
 
