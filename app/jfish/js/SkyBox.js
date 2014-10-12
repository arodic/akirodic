THREE.SkyBoxShader = function(options) {

  THREE.ShaderMaterial.call(this);

  options = options || {};

  this.uniforms = {
    "uFogTopCol": { type: "c", value: options.uFogTopCol || new THREE.Color(0.8,0.8,0.8)},
    "uFogBottomCol": { type: "c", value: options.uFogBottomCol ||new THREE.Color(0.2,0.2,0.2)}
  };

  this.vertexShader = [
    "uniform vec3 uFogTopCol;",
    "uniform vec3 uFogBottomCol;",
    "varying vec3 vColor;",
    "void main() {",

      "vec3 vWorld = (modelMatrix * vec4( position, 1.0 )).xyz;",
      "vec3 eye = normalize( vWorld - cameraPosition );",
      "float dotProduct = dot( eye, vec3(0.,1.,0.) );",
      "dotProduct = ( 2.0 * dotProduct + 1.0) / 2.0;",
      "vColor = mix(uFogBottomCol, uFogTopCol, dotProduct);",
      
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"
  ].join("\n");
  this.fragmentShader = [
    "varying vec3 vColor;",
    "void main() {",
      "gl_FragColor = vec4(vColor, 1.0);",
    "}"
  ].join("\n");

  this.depthWrite = false;

};

THREE.SkyBoxShader.prototype = Object.create(THREE.ShaderMaterial.prototype);

THREE.SkyBox = function(options){

  THREE.Mesh.call( this );

  this.geometry = new THREE.SphereGeometry( 50, 32, 18 );
  this.geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
  this.material = new THREE.SkyBoxShader(options);

};

THREE.SkyBox.prototype = Object.create( THREE.Mesh.prototype );