/**
 * Created by PyCharm.
 * User: akira
 * Date: 2/2/13
 * Time: 4:38 PM
 * To change this template use File | Settings | File Templates.
 */

var touch = {
  x: 0,
  y: 0
};
var oldTouch = {
  x: 0,
  y: 0
};
var tilt = {
  x: 0,
  y: 0
};
var tiltOld = {
  x: 0,
  y: 0
};
var dragging = false;
var dragged = 0;
var locked = false;
var previousHit;

function initControls() {
  // projector = new THREE.Projector();
  bindTouchStart("#container", function(event){
    touchStart(event);
  });
  bindTouchMove("#container", function(event){
    event.preventDefault();
    touchMove(event);
  });
  bindTouchEnd("#container", function(event){
    event.preventDefault();
    touchEnd(event);
  });
  bindTouchEnd(".page", function(event){
    event.stopPropagation();
  });
  bindTouchMove(".page", function(event){
    event.stopPropagation();
  });
  bindTouchEnd(".close", function(event){
    animateCameraHome();
  });
  bindOrientation();
}

function getIntersections(){
  var vector = new THREE.Vector3( touch.x, touch.y, 1 );
  vector = vector.unproject(camera);
  var cameraPos = new THREE.Vector3(camera.matrixWorld.elements[12],camera.matrixWorld.elements[13],camera.matrixWorld.elements[14]);
  raycaster = new THREE.Raycaster( cameraPos, vector.sub( cameraPos ).normalize() );
  var intersects = raycaster.intersectObjects( clickable );
  var hit = false;
  var l = intersects.length;
  if ( l ) {
      for (var i in intersects){
        if (
          intersects[l-i-1].object.name == 'lightswitch' ||
          intersects[l-i-1].object.name == 'hide' ||
          intersects[l-i-1].object.name == 'about' ||
          intersects[l-i-1].object.name == 'blog' ||
          intersects[l-i-1].object.name == 'contact' ||
          intersects[l-i-1].object.name == 'portfolio'){
          hit = intersects[l-i-1].object;
        }
      }
    }
  return hit;
}

function touchMove(event) {
  e = getTouch(event);
  touch = {
    x: (e.pageX / window.innerWidth) * 2 - 1,
    y: - (e.pageY / window.innerHeight) * 2 + 1
  };

  if (dragging && !locked) {
    dragged += 1;
    craneVelocity.damp = 0.97;
    craneVelocity.x = 3*(oldTouch.x-touch.x);
    crane.rotation.y += craneVelocity.x;
    craneVelocity.y = 3*(oldTouch.y-touch.y);
    craneTilt.rotation.x += craneVelocity.y;
    craneTilt.rotation.x = Math.min(Math.max(craneTilt.rotation.x, -0.7), 1.3);
  } else if (!locked) {

    var hit = getIntersections();

    if (!hit) {
      if (previousHit) {
        previousHit.material = previousHit.material2;
        previousHit = null;
      }
      return;
    }

    if (hit != previousHit) {
      if (hit.name == 'lightswitch' || hit.name == 'hide') hit.material = material['cubeRed'];
      else hit.material = material['cubeActive'];
      if (previousHit) previousHit.material = previousHit.material2;
      previousHit = hit;
    }
  }

  oldTouch = touch;
}

function touchStart(event){
  e = getTouch(event);
  touch.x = (e.pageX / window.innerWidth) * 2 - 1;
  touch.y = - (e.pageY / window.innerHeight) * 2 + 1;
  oldTouch.x = touch.x;
  oldTouch.y = touch.y;
  dragging = true;
  dragged = 0;
}

function touchEnd(event){
  dragging = false;
  if (dragged < 25){
    var hit = getIntersections();

    if (hit){
      animateWallWire();
      hit.callback();
    } else if (locked) {
      locked = false;
      craneVelocity.x = 0.004;
      animateCameraHome();
      navigation.clearHash();
    }
  }
}

function bindOrientation(){
  if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", function () {
        var b = event.beta;
        var g = event.gamma;
          tilt.x = b;
          tilt.y = g;
          if (window.orientation == 90){
            tilt.x = g;
            tilt.y = b;
          }
          if (window.orientation == -90){
            tilt.x = g;
            tilt.y = -b;
          }
        if (tilt.y > 90){
          tilt.y = 180 - tilt.y;
        }
      }, true);
  }
}
