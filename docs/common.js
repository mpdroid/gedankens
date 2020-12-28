import * as THREE from './node_modules/three/build/three.module.js';
let font;
let gedanken;
let gendankenElementIds = [];
let gedankenMap = new Map();
const MATHJAX_JS = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/latest.js?config=TeX-MML-AM_CHTML";

// Loads script asynchronously
function addScript(url, async, callback) {
  let ascript = document.createElement("script");
  if (async == true) {
    ascript.setAttribute('async', 'async');
  }
  ascript.src = url;
  if (ascript.readyState) {
    ascript.onreadystatechange = () => {
      if (ascript.readyState == "loaded" ||
        ascript.readyState == "complete") {
        ascript.onreadystatechange = null;
        callback();
      }
    };
  } else {
    ascript.onload = callback;
  }
  document.head.appendChild(ascript);
  return ascript;
}


// Activates gedanken once it scrolls into view
// https://www.javascripttutorial.net/dom/css/check-if-an-element-is-visible-in-the-viewport/#:~:text=When%20an%20element%20is%20in,visible%20part%20of%20the%20screen.&text=If%20the%20element%20is%20in,Otherwise%2C%20it%20returns%20false%20.&text=You%20only%20load%20the%20image,visible%20in%20the%20current%20viewport.
function setVisibleGedanken() {
  let gd;
  for (let elementId of gedankenMap.keys()) {
    const element = document.getElementById(elementId);
    if (!!element) {
      const rect = element.getBoundingClientRect();
      if (
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      ) {
        gd = gedankenMap.get(elementId);
      }
    }
  }
  gedanken = gd;
}

function init(gedankenFn) {
  const gd = new gedankenFn(font);
  gd.initialize();
  return gd;

}

function animate() {
  requestAnimationFrame(animate);
  setVisibleGedanken();
  if (!!gedanken && gedanken.animating) {
    gedanken.animate();
  }
}

// Load fonts before running app
function preload(gedankenate) {
  let countDown = 2;
  const onCount = () => {
    if (--countDown === 0) {
      gedankenate();
    }
  }
  window.onresize = function(){ location.reload(); }
  const fontloader = new THREE.FontLoader();
  fontloader.load('./assets/Roboto_Regular.json', (fnt) => {
    font = fnt;
    onCount();
  });


  let lxconfigscript = document.createElement("script");
  lxconfigscript.type = "text/x-mathjax-config";
  lxconfigscript[(window.opera ? "innerHTML" : "text")] =
    "MathJax.Hub.Config({\n" +
    " startup: { \n" +
    "   ready: () => { \n" +
    " MathJax.startup.defaultReady();\n" +
    " }\n" +
    " },\n" +
    // " MatchWebFonts: {\n" \n" ++
    // " matchFor: {\n" +
    // " 'HTML-CSS': true,\n" +
    // " NativeMML: false,\n" +
    // " SVG: false\n" +
    // " },\n" +
    // "  fontCheckDelay: 2000,\n" +
    // "   fontCheckTimeout: 30 * 1000\n" +
    // " },\n" +
    "    'HTML-CSS' : {\n" +
    "       availableFonts : ['STIX', 'TeX'],\n" +
    "       preferredFont : 'TeX',\n" +
    "       webFont : 'TeX',\n" +
    "       imageFont : 'TeX' \n" +
    "   }, \n" +
    " 'displayAlign': 'left',\n" +
    " 'fast-preview': {disabled: true},\n" +
    " messageStyle: 'none',\n" +
    " tex2jax: {preview: 'none', \n" +
    "  inlineMath: [['$','$'], ['\\\\(','\\\\)']] },\n" +
    " mml2jax: {preview: 'none'}\n" +
    "});";
  document.head.appendChild(lxconfigscript);
  addScript(MATHJAX_JS, true, () => {
    document.body.style.visibility = 'visible';
  onCount();
  });

}

function begin(gedankenFn) {
  preload(() => {
    gedanken = init(gedankenFn);
    gedankenMap.set('platformIrf', gedanken);
    animate();
  });
}

function beginMultiple(gedankenFns, elementIds) {
  preload(() => {
    for (let k = 0; k < gedankenFns.length; k++) {
      const fn = gedankenFns[k];
      const gd = init(fn);
      gendankenElementIds.push(elementIds[k]);
      gedankenMap.set(elementIds[k], gd);
    }
    gedanken = gedankenMap.values().next().value;
    animate();

  });
}

function* narrator(text) {
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    yield words[i] + " ";
  }
}


function narrate(text, callback = () => {}) {
  const nar = narrator(text);
  const elem = document.getElementById('narrated');
  const interval = setInterval(() => {
    let letter = nar.next().value;
    if (letter !== undefined) {
      if (letter !== '~ ') {
        elem.textContent = elem.textContent + letter;
      }
    } else {
      clearInterval(interval);
      callback();
    }
  }, 50);
}
export { begin, beginMultiple, narrate };