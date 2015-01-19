/**
 * Created by PyCharm.
 * User: akira
 * Date: 2/24/13
 * Time: 7:19 PM
 * To change this template use File | Settings | File Templates.
 */
var animating = false;

function animateAmbientFlash(start, end){
  var lightCol = { r:0, g:0, b:0 };
  var lightOff = { r:end[0], g:end[1], b:end[2] };
  var lightOn = { r:start[0], g:start[1], b:start[2] };

  var lightTweenOff = new TWEEN.Tween(lightCol).
         to(lightOff, 500).
         easing( TWEEN.Easing.Cubic.InOut ).
         onUpdate(function(){
           light['ambient'].color.setRGB(lightCol.r,lightCol.g,lightCol.b);
         }).start();


  var lightTweenOn = new TWEEN.Tween(lightCol).
          delay(200).
          to(lightOn, 500).
          easing( TWEEN.Easing.Cubic.InOut ).
          onUpdate(function(){
            light['ambient'].color.setRGB(lightCol.r,lightCol.g,lightCol.b);
          }).start();

  lightTweenOn.chain(lightTweenOff);
}

function animateAmbientDarkness(end){
  var lightCol = { r:light['ambient'].color.r, g:light['ambient'].color.g, b:light['ambient'].color.b };
  var lightDark = { r:end[0], g:end[1], b:end[2] };
  var lightTween = new TWEEN.Tween(lightCol).
         to(lightDark, 2500).
         easing( TWEEN.Easing.Cubic.InOut ).
         onUpdate(function(){
           light['ambient'].color.setRGB(lightCol.r,lightCol.g,lightCol.b);
         }).start();
}

function animateWallWire(){
  var wireTween = new TWEEN.Tween({ value: 0.1 }).
         to({ value: 2.1 }, 2500).
         onUpdate(function(){
           material['wireWall'].uniforms.phase.value = this.value;
         }).start();
}

function animateCameraToLabel(name){
  animating = true;
  var pos = {
    craneX:crane.matrixWorld.elements[12],
    craneY:crane.matrixWorld.elements[13],
    craneZ:crane.matrixWorld.elements[14],
    tilt: craneTilt.rotation.x,
    orbit: crane.rotation.y % (Math.PI*2)
  };
  var posTarget = {
    craneX:page[name].label.matrixWorld.elements[12],
    craneY:page[name].label.matrixWorld.elements[13],
    craneZ:page[name].label.matrixWorld.elements[14],
    tilt:page[name].tilt,
    orbit:page[name].orbit % (Math.PI*2)
  };

  if (pos.orbit - posTarget.orbit > Math.PI) posTarget.orbit += Math.PI*2;
  if (pos.orbit - posTarget.orbit < -Math.PI) posTarget.orbit -= Math.PI*2;

  var craneTween= new TWEEN.Tween(pos).
         to(posTarget, 1500).
         easing( TWEEN.Easing.Cubic.InOut ).
         onUpdate(function(){
           crane.position.set(pos.craneX, pos.craneY, pos.craneZ);
           crane.rotation.y = pos.orbit;
           craneTilt.rotation.x = pos.tilt;
         }).start();
  craneTween.onStart(function(){
    animateAmbientDarkness([-0.8, -0.4, -0.3]);
    hideAllContent();
    showAllLabels();
  });
  craneTween.onComplete(function(){
    animateCameraToContent(name);
  });
}

function animateCameraToContent(name){
  page[name].content.updateMatrixWorld();
  var pos = {
    craneX:crane.matrixWorld.elements[12],
    craneY:crane.matrixWorld.elements[13],
    craneZ:crane.matrixWorld.elements[14],
    tilt: craneTilt.rotation.x,
    orbit: crane.rotation.y % (Math.PI*2),
    distance: camera.position.z
  };
  var posTarget = {
    craneX:page[name].content.matrixWorld.elements[12],
    craneY:page[name].content.matrixWorld.elements[13],
    craneZ:page[name].content.matrixWorld.elements[14],
    tilt:page[name].tilt,
    orbit:page[name].orbit % (Math.PI*2),
    distance: -1.0
  };

  if (pos.orbit - posTarget.orbit > Math.PI) posTarget.orbit += Math.PI*2;
  if (pos.orbit - posTarget.orbit < -Math.PI) posTarget.orbit -= Math.PI*2;

  var craneTween= new TWEEN.Tween(pos).
         to(posTarget, 1000).
         easing( TWEEN.Easing.Cubic.InOut ).
         onUpdate(function(){
           crane.position.set(pos.craneX, pos.craneY, pos.craneZ);
           crane.rotation.y = pos.orbit;
           craneTilt.rotation.x = pos.tilt;
           camera.position.z = pos.distance;
         }).start();
  craneTween.onStart(function(){
    showContent(name);
    showLabel(name);
  });
  craneTween.onComplete(function(){
    animating = false;
  });
}

function animateCameraHome(){
  animating = true;
  var pos = {
    craneX:crane.matrixWorld.elements[12],
    craneY:crane.matrixWorld.elements[13],
    craneZ:crane.matrixWorld.elements[14],
    distance: camera.position.z
  };
  var posTarget = {
    craneX:0,
    craneY:1,
    craneZ:0,
    distance: -1.7
  };
  var craneTween = new TWEEN.Tween(pos).
         to(posTarget, 1500).
         easing( TWEEN.Easing.Cubic.InOut ).
         onUpdate(function(){
           crane.position.set(pos.craneX, pos.craneY, pos.craneZ);
           camera.position.z = pos.distance;
         }).start();

  craneTween.onStart(function(){
    animateAmbientDarkness([0,0,0]);
    hideAllContent();
    showAllLabels();
  });
  craneTween.onComplete(function(){animating = false;});
}

function showContent(name){
  page[name].html.style.display = 'block';
  var opacity = {value:0};
  var opacityTween= new TWEEN.Tween(opacity).
         to({value:1}, 1000).
         easing( TWEEN.Easing.Cubic.InOut ).
         onUpdate(function(){
           page[name].html.style.opacity = opacity.value;
         }).start();
  opacityTween.onComplete(function(){locked = true;});
}

function hideAllContent(){
  var opacity = {value:1};
  var opacityTween= new TWEEN.Tween(opacity).
         to({value:0}, 500).
         easing( TWEEN.Easing.Cubic.InOut ).
         onUpdate(function(){
          for(var i in page){
            page[i].html.style.opacity = opacity.value;
          }
         }).start();
  opacityTween.onComplete(function(){
    for(var i in page){
      page[i].html.style.display = 'none';
    }
  });

}

function showLabel(name){
  var opacity = {value:1};
  var opacityTween= new TWEEN.Tween(opacity).
         to({value:0}, 1000).
         easing( TWEEN.Easing.Cubic.InOut ).
         onUpdate(function(){
           for(var i in page){
             if (i != name){
               page[i].label.material.opacity = opacity.value;
               page[i].line.material.opacity = opacity.value;
             }
           }
         }).start();
}

function showAllLabels(){
  var opacity = {value:0};
  var opacityTween= new TWEEN.Tween(opacity).
         to({value:1}, 500).
         easing( TWEEN.Easing.Cubic.InOut ).
         onUpdate(function(){
          for(var i in page){
            page[i].label.material.opacity = Math.max(opacity.value, page[i].label.material.opacity);
            page[i].line.material.opacity = Math.max(opacity.value, page[i].label.material.opacity);
          }
         }).start();

}