THREE.World = function(globals){

  THREE.Object3D.call( this );

  this.name = "World";

  var skybox = new THREE.SkyBox(globals);
  this.add(skybox);

  var plankton = new THREE.Plankton(globals);
  plankton.renderDepth = -100000;
  this.add(plankton);

  var jellyfish = new THREE.Jellyfish(globals);
  this.add(jellyfish);

  var jellyfish2 = new THREE.Jellyfish(globals);
  this.add(jellyfish2);

  var jellyfish3 = new THREE.Jellyfish(globals);
  this.add(jellyfish3);

  var jellyfish4 = new THREE.Jellyfish(globals);
  this.add(jellyfish4);

  var jellyfish5 = new THREE.Jellyfish(globals);
  this.add(jellyfish5);

  this.update = function(camera) {

    plankton.update(globals.time);
    jellyfish.update(globals.time, camera);
    jellyfish2.update(globals.time, camera);
    jellyfish3.update(globals.time, camera);
    jellyfish4.update(globals.time, camera);
    jellyfish5.update(globals.time, camera);

  };

};

THREE.World.prototype = Object.create( THREE.Object3D.prototype );