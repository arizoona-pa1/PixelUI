export class PixelDropdown extends PixelDialog {
  static observedAttributes = ["dir"];
  constructor() {
    super();
    this._dir = "bottom-mid";
    this._hover = this.hasAttribute("hover");

    this.attachShadow({ mode: "open" });
    const template = document.createElement("div");
    template.classList.add("template");
    template.classList.add("dropdown");

    this.container = template;

    this.optionsTmp = this.querySelector('[slot="options"]');
    this.contentSlot = document.createElement("slot");
    this.contentSlot.classList.add("f");
    template.appendChild(this.contentSlot);
    this.optionSlot = document.createElement("slot");
    this.optionSlot.setAttribute("name", "options");
    template.appendChild(this.optionSlot);

    this._sticky = this.optionsTmp.classList.contains("sticky");
  }
  async connectedCallback() {
    try {
      await this.loadStyles(
        ["public", "components/_dropdown"],
        this.shadowRoot
      );
    } catch (err) {
      console.error(`Failed to load styles for ${this.constructor.name}:`, err);
    }
    this.render();
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "dir") {
      this.dir = newValue;
    }
  }
  render() {
    // Clear shadow root and append container
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(this.container);

    this.modal = this.optionSlot;
    this.close();

    const direction = this.optionsTmp.getAttribute("dir");
    const id = this.getAttribute("id");
    if (this._sticky) {
      this.screenBtnClose.setAttribute("slot", "options");
      this.prepend(this.screenBtnClose);
    }
    if (direction) this.dir = direction;

    if (this._hover) {
      this.container.classList.add("hover");
      return;
    }

    const els = document.body.querySelectorAll(`[target="${id}"][button]`);
    for (const el of els) {
      this.bindBtns(el);
    }
    // auto Select Button in dropdown
    for (const el of this.querySelectorAll("[button]")) {
      const a = el.closest("p-dropdown,p-modal");
      if (a.tagName == "p-modal" || el.hasAttribute("target")) continue;
      if (a === this && !this.buttonsEventBound.has(el)) {
        this.bindBtns(el);
        this.buttonsEventBound.add(el);
      }
    }
  }
  get dir() {
    return this._dir;
  }
  set dir(val) {
    this._dir = val;
    this.removeAttribute("dir");
    this.optionsTmp.setAttribute("dir", val);

    const dirMap = {
      "top-mid": "grid-horizontal-center",
      "bottom-mid": "grid-horizontal-center",
      "left-mid": "grid-vertical-center",
      "right-mid": "grid-vertical-center",
    };
    if (dirMap.hasOwnProperty(val)) this.container.classList.add(dirMap[val]);
  }
}

customElements.define("p-dropdown", PixelDropdown);

export class Dropdown {
  constructor() {
    const el = document.createElement("p-dropdown");

    return el;
  }
}
