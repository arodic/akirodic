THREE.SkyBoxShader = function(globals) {

  THREE.ShaderMaterial.call(this);

  this.globals = globals;

  this.uniforms = {
    "uFogTopCol": { type: "c", value: globals.uFogTopCol || new THREE.Color(0.8,0.8,0.8)},
    "uFogBottomCol": { type: "c", value: globals.uFogBottomCol ||new THREE.Color(0.2,0.2,0.2)}
  };

  this.vertexShader = [
    "uniform vec3 uFogTopCol;",
    "uniform vec3 uFogBottomCol;",
    "varying vec3 vFogColor;",
    "void main() {",

      // position, eye
      "vec3 vWorld = (modelMatrix * vec4( position, 1.0 )).xyz;",
      "vec3 eye = normalize( vWorld - cameraPosition );",
      
      // Fog
      "float dotProduct = dot( eye, vec3(0.,1.,0.) );",
      "dotProduct = ( 2.0 * dotProduct + 1.0) / 2.0;",
      "vFogColor = mix(uFogBottomCol, uFogTopCol, dotProduct);",
      
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n");
  this.fragmentShader = [
    "varying vec3 vFogColor;",
    "void main() {",
      "gl_FragColor = vec4(vFogColor, 1.0);",
    "}"
  ].join("\n");

  this.depthWrite = false;

};

THREE.SkyBoxShader.prototype = Object.create(THREE.ShaderMaterial.prototype);

THREE.SkyBox = function(globals){

  THREE.Mesh.call( this );

  this.globals = globals;

  this.geometry = new THREE.SphereGeometry( 25, 32, 18 );
  this.geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
  this.material = new THREE.SkyBoxShader(globals);

};

THREE.SkyBox.prototype = Object.create( THREE.Mesh.prototype );