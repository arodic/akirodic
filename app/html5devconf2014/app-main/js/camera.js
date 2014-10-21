(function(){

  var camera, cameraTarget, crane, craneTilt;
  var craneVelocity = {
    x: 0.004,
    y: 0,
    damp: 1
  };

  //
  
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

  //

  function initCamera(scene){
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.name = "camera";
    camera.position.set(0, 0, -11);
    cameraTarget = new THREE.Object3D();
    cameraTarget.name = "cameraTarget";
    cameraTarget.position.set(0, 0, 0);
    crane = new THREE.Object3D();
    crane.name = "crane";
    crane.position.set(0, 8, 0);
    craneTilt = new THREE.Object3D();
    craneTilt.rotation.set(Math.PI/6, 0, 0);
    craneTilt.name = "craneTilt";

    scene.add(crane);
    crane.add(craneTilt);
    craneTilt.add(camera);
    scene.add(cameraTarget);

    return camera;
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

  //
  //
  
  function initControls(element) {
    projector = new THREE.Projector();
    bindTouchStart(element, function(event){
      touchStart(event);
    });
    bindTouchMove(element, function(event){
      event.preventDefault();
      touchMove(event);
    });
    bindTouchEnd(element, function(event){
      event.preventDefault();
      touchEnd(event);
    });
    // bindTouchEnd(".page", function(event){
    //   event.stopPropagation();
    // });
    // bindTouchMove(".page", function(event){
    //   event.stopPropagation();
    // });
    // bindTouchEnd(".close", function(event){
    //   animateCameraHome();
    // });
    bindOrientation();
  }

  // function getIntersections(){
  //   var vector = new THREE.Vector3( touch.x, touch.y, 1 );
  //   projector.unprojectVector( vector, camera );
  //   var cameraPos = new THREE.Vector3(camera.matrixWorld.elements[12],camera.matrixWorld.elements[13],camera.matrixWorld.elements[14]);
  //   raycaster = new THREE.Raycaster( cameraPos, vector.sub( cameraPos ).normalize() );
  //   var intersects = raycaster.intersectObjects( clickable );
  //   var hit = false;
  //   var l = intersects.length;
  //   if ( l ) {
  //       for (var i in intersects){
  //         if (
  //           intersects[l-i-1].object.name == 'lightswitch' ||
  //           intersects[l-i-1].object.name == 'hide' ||
  //           intersects[l-i-1].object.name == 'about' ||
  //           intersects[l-i-1].object.name == 'blog' ||
  //           intersects[l-i-1].object.name == 'contact' ||
  //           intersects[l-i-1].object.name == 'portfolio'){
  //           hit = intersects[l-i-1].object;
  //         }
  //       }
  //     }
  //   return hit;
  // }

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

      // var hit = getIntersections();

      // if (!hit) {
      //   if (previousHit) {
      //     previousHit.material = previousHit.material2;
      //     previousHit = null;
      //   }
      //   return;
      // }

      // if (hit != previousHit) {
      //   if (hit.name == 'lightswitch' || hit.name == 'hide') hit.material = material['cubeRed'];
      //   else hit.material = material['cubeActive'];
      //   if (previousHit) previousHit.material = previousHit.material2;
      //   previousHit = hit;
      // }
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
    if (dragged < 25 && !animating){
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



  window.initCamera = initCamera;
  window.updateCamera = updateCamera;
  window.initControls = initControls;

})();
