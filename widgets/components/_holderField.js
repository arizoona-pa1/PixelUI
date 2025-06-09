// /widgets/holderfield.js
export class PixelHolderField extends PixelHTML {
  static observedAttributes = ["message"];
  renderTemplate() {
    const template = document.createElement("template");
    template.innerHTML = `
      <div class="field">
        <slot></slot>
      </div>
      <div class="tp-message">
      </div>
    `;

    return template;
  }
  constructor() {
    super();
    const tmpl = this.renderTemplate();

    const shadow = this.attachShadow({ mode: "open" });
    shadow.append(tmpl.content.cloneNode(true));

    this._message;
    this.messageBox = document.createElement("div");
    this.messageBox.classList.add("message-box");
  }

  async connectedCallback() {
    await this.loadStyles(
      ["public", "components/_holderField"],
      this.shadowRoot
    ).catch((err) => {
      console.error(`Failed to load styles for ${this.constructor.name}:`, err);
    });
    this.render();
  }

  render() {
    const tmpl = this.shadowRoot.querySelector(".tp-message");
    tmpl.append(this.messageBox);
    // Move existing child elements to the slot

    if (this._message) this.message = this._message;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "message" && newValue !== oldValue) {
      this.message = newValue;
    }
  }
  set message(value) {
    console.log(value);
    if (this.messageBox && value) {
      this._message = value;
      this.messageBox.innerHTML = value ? `<p>${value}</p>` : "";
    }
  }
  // Public methods
  get message() {
    return this._message;
  }
}

customElements.define("p-field", PixelHolderField);

export class HolderField {
  constructor(options = {}) {
    const element = document.createElement("p-field");

    if (options.id) element.id = options.id;
    if (options.message) element._message = options.message;

    // Handle append
    if (options.append) {
      appendElement(element, options.append);
    }
    return element;
  }
}
