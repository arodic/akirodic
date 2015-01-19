var camera, cameraTarget, crane, craneTilt;
var craneVelocity = {
  x: 0.004,
  y: 0,
  damp: 1
};

function initCamera(){
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10);
  camera.position = new THREE.Vector3(0, 0, -1.7);
  cameraTarget = new THREE.Object3D();
  cameraTarget.position = new THREE.Vector3(0, 0.05, 0);
  crane = new THREE.Object3D();
  crane.position = new THREE.Vector3(0, 1, 0);
  craneTilt = new THREE.Object3D();

  scene.add(crane);
  crane.add(craneTilt);
  craneTilt.add(camera);
  scene.add(cameraTarget);
}

function resizeCamera() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function updateCamera(){
  if (!dragging && !locked){
    crane.rotation.y += craneVelocity.x;
    craneTilt.rotation.x += craneVelocity.y;
    craneTilt.rotation.x = Math.min(Math.max(craneTilt.rotation.x, -0.5), 1.3);
    craneVelocity.x *= craneVelocity.damp;
    craneVelocity.y *= craneVelocity.damp;
  }
  tiltOld.y = (tiltOld.y*49+tilt.y)/50;
  crane.rotation.z = tiltOld.y*Math.PI/180;

  camera.lookAt(cameraTarget.position);
  camera.updateMatrixWorld();
  for (var i in page) {
    page[i].label.rotation.setEulerFromRotationMatrix( camera.matrixWorld );
  }
}