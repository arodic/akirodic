THREE.World = function(globals){

  THREE.Scene.call( this );

  this.name = "World";

  var skybox = new THREE.SkyBox(globals);
  this.add(skybox);

  var plankton = new THREE.Plankton(globals);
  plankton.renderDepth = -100000;
  this.add(plankton);

  var jellyfish = new THREE.Jellyfish(globals);
  this.add(jellyfish);

  // var jellyfish2 = new THREE.Jellyfish(globals);
  // this.add(jellyfish2);

  // var jellyfish3 = new THREE.Jellyfish(globals);
  // this.add(jellyfish3);

  // var jellyfish4 = new THREE.Jellyfish(globals);
  // this.add(jellyfish4);

  // var jellyfish5 = new THREE.Jellyfish(globals);
  // this.add(jellyfish5);

  this.update = function() {

    plankton.update();
    jellyfish.update();
    // jellyfish2.update();
    // jellyfish3.update();
    // jellyfish4.update();
    // jellyfish5.update();

  };

};

THREE.World.prototype = Object.create( THREE.Scene.prototype );