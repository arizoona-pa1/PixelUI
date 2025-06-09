// /widgets/button.js
export class PixelButton extends PixelHTML {
  static observedAttributes = ["value", "type", "enable-blob", "version"];
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Initialize properties with defaults
    this._value = "button";
    this._type = "button";
    this._enableBlob = true;
    this._version = "0";
    this._hold = true;
    // Create container element
    const parentElement = document.createElement("div");
    const textButton = document.createElement("div");
    this.container = parentElement;
    this.button = document.createElement("button");

    this.icon_slot_left = document.createElement("slot");
    this.icon_slot_right = document.createElement("slot");
    this.loading = document.createElement("slot");
    this.buttonNode = document.createElement("slot");

    this.border = document.createElement("div");
    // -----------------------
    // setup class
    this.icon_slot_left.setAttribute("name", "icon-left");
    this.icon_slot_left.classList.add("icon");
    this.icon_slot_right.setAttribute("name", "icon-right");
    this.icon_slot_right.classList.add("icon");
    this.loading.setAttribute("name", "loading");
    textButton.classList.add("text");

    parentElement.classList.add("template");
    parentElement.setAttribute("version", this._version);
    this.border.classList.add("border");
    // -----------------------
    // binding Document
    parentElement.appendChild(this.button);
    this.button.prepend(this.icon_slot_left);

    textButton.appendChild(this.buttonNode);
    this.button.appendChild(textButton);
    this.button.appendChild(this.icon_slot_right);
    this.button.appendChild(this.loading);
    this.button.appendChild(this.border);

    // -----------------------
    // setup Attr
    this.classList.add("init");
    // -----------------------
    const slotBindEvent = [this.icon_slot_left, this.icon_slot_right];
    this.addEventListenerFilled(...slotBindEvent);
  }

  async connectedCallback() {
    try {
      await this.loadStyles(["public", "components/_button"], this.shadowRoot);
    } catch (err) {
      console.error(`Failed to load styles for ${this.constructor.name}:`, err);
    }
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.directionSlot(this, "icon");
    // Clear shadow root and append container
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(this.container);

    // Update button attributes
    this.button.type = this._type;
    this.button.dataset.enableBlob = this._enableBlob;
    this.button.dataset.version = this._version;

    this.button.disabled = false;
    this.append(this._value);
  }

  setupEventListeners() {
    this.button.addEventListener("click", this.handleClick.bind(this));
  }

  handleClick(e) {
    e.preventDefault();

    // Handle loading state
    const loading = {
      start: this.startLoading.bind(this),
      stop: this.stopLoading.bind(this),
    };

    // Trigger custom event if provided
    if (typeof this._event === "string") {
      setTimeout(() => {
        if (typeof window[this._event] === "function") {
          window[this._event](loading, e);
        }
      }, 0);
    } else if (typeof this._event === "function") {
      this._event(loading, e);
    }

    // Handle blob animation
    if (this._enableBlob) {
      this.createBlobEffect(e);
    }
  }

  startLoading() {
    this.button.dataset.loading = "true";
    this.button.disabled = true;
  }

  stopLoading() {
    this.button.dataset.loading = "false";
    this.button.disabled = false;
  }

  createBlobEffect(e) {
    const spot = document.createElement("span");
    spot.classList.add("spot");

    // Calculate position relative to button
    const rect = this.button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Set blob position
    spot.style.left = `${x}px`;
    spot.style.top = `${y}px`;

    // Append blob to button
    const maxDimension = Math.max(rect.width, rect.height);
    this.button.style.setProperty("--r-coding-spot", `${maxDimension}px`);
    this.button.appendChild(spot);

    // Remove blob after animation
    spot.addEventListener("animationend", () => {
      spot.remove();
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "value":
        this.value = newValue;
        break;
      case "type":
        this.type = newValue;
        break;
      case "data-enable-blob":
        this.enableBlob = !!newValue;
        break;
      case "version":
        this.version = newValue;
        break;
    }
  }

  // Getters and setters for properties
  get hold() {
    return this._hold;
  }

  set hold(val) {
    this._hold = !!val;
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this.setAttribute("value", val);
    this.button.setAttribute("value", val);
    this.innerHTML = val;
  }

  get type() {
    return this._type;
  }

  set type(val) {
    this._type =
      val.toString().toLowerCase() == "submit" ? "submit" : this._type;
    this.setAttribute("type", this._type);
    this.button.setAttribute("type", this._type);
  }

  get enableBlob() {
    return this._enableBlob;
  }

  set enableBlob(val) {
    this._enableBlob = !!val;
    this.toggleAttribute("enable-blob", val);
    this.button.dataset.enableBlob = this._enableBlob;
  }

  get version() {
    return this._version;
  }

  set version(val) {
    this._version = val;
    this.setAttribute("version", val);
    this.button.dataset.version = this._version;
  }
  get keyframe() {
    return this._keyframe;
  }

  set keyframe(val) {
    const keyframe = ["static", "ease-out-in", "ease-in-out"];
    if (Number.isInteger(Number(val))) {
      val = keyframe[val];
    }

    this._keyframe = val;
    this.container.setAttribute("keyframe", val);
  }

  get event() {
    return this._event;
  }

  set event(f) {
    if (!f instanceof Function) {
      console.error("Failed to get Fucntion ,this type isn't Function", f);
    }
    this._event = f;
  }
}

customElements.define("p-button", PixelButton);

export class Button {
  constructor(options = {}) {
    if (Object.isEmpty(options)) return false;
    const el = document.createElement("p-button");

    // Set attributes
    const attributes = new Set(PixelButton.observedAttributes);
    for (const [key, value] of Object.entries(options)) {
      if (attributes.has(key)) {
        el.setAttribute(key, value);
      } else if (key == "event") {
        el.event = value;
      }
    }

    return el;
  }
}
