"use strict";
var container, stats;
var scene;
var projector, raycaster, intersects, touched;
var renderer, cssRenderer;
var time = 0, wirePhase = 0;
var object = [];
var light = [];
var page = [];
var clickable = [];
var texture = [];
var material = [];
var mesh, zmesh, geometry;
var date = new Date();

window.onload = function () {
  if (Detector.webgl) {
    init();
    animate();
    //setTimeout(directToHash, 1000);
    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();
  } else {
    document.body.appendChild(Detector.getWebGLErrorMessage());
    tracking('error','no-webgl');
  }
};
function init() { // RENDERERS
  {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.domElement.style.position = "fixed";
    renderer.domElement.id = 'canvas';
    document.getElementById('container').appendChild(renderer.domElement);

    cssRenderer = new THREE.CSS3DRenderer();
    cssRenderer.domElement.style.position = 'fixed';
    document.getElementById('container').appendChild(cssRenderer.domElement);

    //stats = new Stats();
    //stats.domElement.style.position = 'fixed';
    //document.getElementById('container').appendChild(stats.domElement);
  }
  initScene();
  initCamera();
  initControls();
  // initFullscreen();
  // initNavigation();
}

function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  resizeCamera();
  render();
}

function animate() {
  time = Date.now();
  TWEEN.update();
  //stats.update();
  updateCamera();
  render();

  requestAnimationFrame(animate);
}

function render() {
  renderer.render(scene, camera);
  cssRenderer.render(scene, camera);
}
