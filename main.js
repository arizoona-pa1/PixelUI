const scriptUrl = document.currentScript.src.replace("/main.js", "");

if (!window.customElements) {
  const script = document.createElement("script");
  script.src =
    "https://unpkg.com/@webcomponents/webcomponentsjs@2.8.0/webcomponents-bundle.js";
  document.head.appendChild(script);
}
if ("adoptedStyleSheets" in Document.prototype) {
  // Use constructed stylesheet
} else {
  // Fallback to style tag
}
// if (!document.head.querySelector(`script[src=${scriptUrl + "src.js"}]`)) {
//   const script = document.createElement("script");
//   script.src = scriptUrl + "src.js";
//   document.head.appendChild(script);
// }
const supportsConstructableStylesheets =
  typeof CSSStyleSheet !== "undefined" &&
  "replaceSync" in CSSStyleSheet.prototype;

// if (supportsConstructableStylesheets) {
//   const sheet = new CSSStyleSheet();
//   sheet.replaceSync(`:host { color: red; }`);
//   document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
// } else {
//   // Fallback for older browsers
//   const style = document.createElement("style");
//   style.textContent = `:host { color: red; }`;
//   document.head.appendChild(style);
// }
Object.prototype.isEmpty = function (o) {
  return Object.keys(o) === 0;
};
const styleSheetCache = new Map();
// Extract just the pathname if needed
async function getJsonFile(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to load JSON from ${url}:`, error);
    // Return empty object as fallback
    return {};
  }
}

function appendElement(el, options) {
  if (typeof options.append === "string") {
    el.innerHTML = options.append;
  } else if (options.append instanceof Node) {
    el.appendChild(options.append);
  }
}

function _setAttributes(el, options, SUPPORTED_ATTRIBUTES) {
  for (const [key, value] of Object.entries(options)) {
    if (!SUPPORTED_ATTRIBUTES.has(key)) continue;

    // Also set as attribute for proper DOM reflection
    if (value !== null && value !== undefined) {
      el.setAttribute(key, value);
    }
  }
}
