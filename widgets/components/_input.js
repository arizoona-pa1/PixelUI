// /widgets/input.js
export class PixelInput extends PixelHTML {
  static observedAttributes = [
    "minlength",
    "maxlength",
    "pattern",
    "template",
    "behavior",
    "value",
    "disabled",
    "readonly",
    "name",
    "autocomplete",
    "placeholder",
    "aria-placeholder",
    "type",
    "dir",
    "label",
    "aria-label",
    "data-version",
    "version",
    "keyframe",
  ];
  // renderTemplate() {
  //   const template = document.createElement("template");
  //   return template;
  // }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._value = "";
    this._disabled = false;
    this._readonly = false;
    this._name = "";
    this._dir = "ltr";
    this._type = "text";
    this._placeholder = "";
    this._autocomplete = "on"; // on/off
    this._label = "";
    this._version = "0";
    this._keyframe = "static";
    this._pattern = "";
    this._maxlength = "";
    this._minlength = "";
    this._tempalte = "0";
    this._behavior = "0";

    // this._children = this.children;

    // -----------------------
    // setup create Document
    const parentElement = document.createElement("template");
    this.container = parentElement;

    this.holderField = document.createElement("p-field");
    this.input = document.createElement("input");
    this.input_tmp = document.createElement("div");
    this.label_tmp = document.createElement("label");
    this.icon_slot_left = document.createElement("slot");
    this.icon_slot_right = document.createElement("slot");
    this.textGroup_slot_right = document.createElement("slot");
    this.textGroup_slot_left = document.createElement("slot");
    this.border = document.createElement("div");
    // -----------------------
    // setup class
    this.input_tmp.classList.add("input");
    this.icon_slot_left.setAttribute("name", "icon-left");
    this.icon_slot_left.classList.add("icon");
    this.icon_slot_right.setAttribute("name", "icon-right");
    this.icon_slot_right.classList.add("icon");
    this.textGroup_slot_right.setAttribute("name", "text-group-right");
    this.textGroup_slot_right.classList.add("text-group");
    this.textGroup_slot_left.setAttribute("name", "text-group-left");
    this.textGroup_slot_left.classList.add("text-group");
    parentElement.classList.add("template");
    parentElement.dataset.version = this._version;
    parentElement.dataset.keyframe = this._keyframe;
    this.border.classList.add("border");
    // -----------------------
    // binding Document
    this.input_tmp.appendChild(this.input);
    this.input_tmp.appendChild(this.label_tmp);
    parentElement.appendChild(this.input_tmp);
    parentElement.prepend(this.icon_slot_left);
    parentElement.prepend(this.textGroup_slot_left);
    parentElement.appendChild(this.icon_slot_right);
    parentElement.appendChild(this.textGroup_slot_right);
    parentElement.appendChild(this.border);
    this.holderField.appendChild(parentElement);
    // -----------------------
    // setup Attr
    this.input.type = this._type;
  }

  async connectedCallback() {
    try {
      await this.loadStyles(
        ["public", "builds/template", "components/_input"],
        this.shadowRoot
      );
    } catch (err) {
      console.error(`Failed to load styles for ${this.constructor.name}:`, err);
    }
    this.render();
  }

  render() {
    this.directionSlot(this, "icon", "text-group");
    this.querySelectorAll("slot");
    this.shadowRoot.appendChild(this.holderField);
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case "disabled":
      case "readonly":
        // Boolean attributes
        this.input[name] = !!newValue;
        break;
      case "aria-placeholder":
        this.placeholder = newValue;
        break;
      case "data-version":
        this.version = newValue;
        break;
      case "aria-label":
        this.label = newValue;
        break;
      default:
        // String attributes
        this[name] = newValue;
    }
  }

  // Getters and setters for each attribute
  get template() {
    return this._template;
  }

  set template(val) {
    this._template = val;
    this.container.setAttribute("template", val);
  }

  get behavior() {
    return this._behavior;
  }

  set behavior(val) {
    const behavior = ["center", "left", "right"];
    if (Number.isInteger(Number(val))) {
      val = behavior[val];
    }

    this._behavior = val;
    this.container.setAttribute("behavior", val);
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

  get pattern() {
    return this._minlength;
  }

  set pattern(val) {
    this._pattern = val;
    this.input.setAttribute("pattern", val);
  }

  get minlength() {
    return this._minlength;
  }

  set minlength(val) {
    this._minlength = val;
    this.input.setAttribute("minlength", val);
  }
  get maxlength() {
    return this._maxlength;
  }

  set maxlength(val) {
    this._maxlength = val;
    this.input.setAttribute("maxlength", val);
  }

  get version() {
    return this._version;
  }

  set version(val) {
    this._version = val;
    this.container.dataset.version = val;
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
    this.input.value = val;
  }

  get disabled() {
    return this._disabled;
  }

  set disabled(val) {
    this._disabled = !!val;
    if (val) {
      this.setAttribute("disabled", "");
      this.input.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
      this.input.removeAttribute("disabled");
    }
  }

  get readonly() {
    return this._readOnly;
  }

  set readonly(val) {
    this._readOnly = !!val;
    if (val) {
      this.setAttribute("readonly", "");
      this.input.setAttribute("readonly", "");
    } else {
      this.input.removeAttribute("readonly");
      this.removeAttribute("readonly");
    }
  }

  get name() {
    return this._name;
  }

  set name(val) {
    this._name = val;
    this.input.name = val;
    this.setAttribute("name", val);
  }
  get label() {
    return this._label;
  }

  set label(val) {
    this._label = val;
    this.setAttribute("label", val);

    if (val) {
      this.label_tmp.innerHTML = val;
      this.label_tmp.hidden = false;
    } else {
      this.label_tmp.innerHTML = "";
      this.label_tmp.hidden = true;
    }
  }

  get autocomplete() {
    return this._autocomplete;
  }

  set autocomplete(val) {
    const v = val.trim().toLowerCase() == "off" ? false : !!val;
    if (v) {
      this._autocomplete = "on";
    } else {
      this._autocomplete = "off";
    }
    this.input.autocomplete = this._autocomplete;
    this.setAttribute("autocomplete", this._autocomplete);
  }

  get placeholder() {
    return this._placeholder;
  }

  set placeholder(val) {
    this._placeholder = val;
    this.input.placeholder = val;
    this.setAttribute("placeholder", val);
  }

  get type() {
    return this._type;
  }

  set type(val) {
    this._type = val;
    this.input.type = val;
    this.setAttribute("type", val);
  }

  get dir() {
    return this._dir;
  }

  set dir(val) {
    if (val) {
      this._dir = val;
      this.input.setAttribute("dir", val);
      this.removeAttribute("dir");
    }
  }
  // ... (keep all other methods from previous implementation unchanged)
}

customElements.define("p-input", PixelInput);

export class Input {
  constructor(options = {}) {
    // if (Object.isEmpty(options)) return false;
    const el = document.createElement("pixel-input");
    // Set attributes

    _setAttributes(el, options, new Set(PixelInput.observedAttributes));

    // ... (keep all other attribute setting logic)

    return el;
  }
}
