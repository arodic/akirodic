function initScene(){
  scene = new THREE.Scene();

  light['sphere'] = new THREE.HemisphereLight( 0xffddee, 0x229988, 1.0 );
  scene.add(light['sphere']);
  light['ambient'] = new THREE.AmbientLight(0x000000);
  scene.add(light['ambient']);

  // TEXTURES / MATERIALS
  texture['wall'] = THREE.ImageUtils.loadTexture("models/wall.jpg");
  material['wall'] = new THREE.MeshLambertMaterial({color: 0xFFFFFF, map: texture['wall']});

  // MODELS
  var loader = new THREE.ColladaLoader();
  loader.load( 'models/scene.dae', function ( collada ) {
    object['scene'] = collada.scene;
    scene.add(object['scene']);
    object['scene'].children[0].children[1].children[0].material = material['wall'];
  });
}
