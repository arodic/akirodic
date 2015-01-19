THREE.PlanktonShader = function(globals) {

  THREE.ShaderMaterial.call(this);

  this.globals = globals;

  this.uniforms = {
    "map": { type: "t", value: THREE.ImageUtils.loadTexture('images/plankton.jpg') },
    "caustics": { type: "t", value: caustics[0]},
    "uFogTopCol": { type: "c", value: globals.uFogTopCol || new THREE.Color(0.8,0.8,0.8)},
    "uFogBottomCol": { type: "c", value: globals.uFogBottomCol ||new THREE.Color(0.2,0.2,0.2)},
    "uFogDist": { type: "f", value: 1},
    "uPointSize": { type: "f", value: 100},
    "uTurb": { type: "v3", value: new THREE.Vector3(0.8,0.8,1.0)},
    "uTime": { type: "f", value: 0}
  };

  this.vertexShader = [
    "uniform float uTime;",
    "uniform vec3 uTurb;",
    "uniform vec3 uFogTopCol;",
    "uniform vec3 uFogBottomCol;",
    "uniform float uFogDist;",
    "uniform float uPointSize;",
    "varying vec3 vWorld;",
    // "varying vec3 vColor;",
    "varying vec2 vUv;",
    "void main() {",

      "vWorld = (modelMatrix * vec4( position, 1.0 )).xyz;",

      "float turbSpeed = uTime * uTurb.x;",
      "float turbFreq = uTurb.y;",
      "float turbAmp = uTurb.z;",
      "vWorld += vec3(sin(position.z * turbFreq + turbSpeed) * turbAmp, sin(position.x * turbFreq + turbSpeed) * turbAmp, sin(position.y * turbFreq + turbSpeed) * turbAmp);",

      // "vec3 eye = normalize( vWorld - cameraPosition );",
      // "float dotProduct = dot( eye, vec3(0.,1.,0.) );",
      // "dotProduct = ( 2.0 * dotProduct + 1.0) / 2.0;",
      // "vColor = mix(uFogBottomCol, uFogTopCol, dotProduct);",

      "vUv = uv;",
      "vec4 mvPosition = viewMatrix * vec4( vWorld, 1.0 );",
      "gl_Position = projectionMatrix * mvPosition;",
      "gl_PointSize = 100. * uPointSize / length( mvPosition.xyz );",
    "}"
  ].join("\n");
  this.fragmentShader = [
    "uniform float uTime;",
    "uniform sampler2D map;",
    "uniform sampler2D caustics;",
    "varying vec3 vWorld;",
    // "varying vec3 vColor;",
    "varying vec2 vUv;",
    "void main() {",

      "float a = 0.25 * uTime * (1.0 + vUv.x);",
      "if (vUv.y < 0.5) a = -a;",
      "mat2 r = mat2(cos(a), -sin(a), sin(a), cos(a));",
      "vec2 vUv2 = vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) - vec2(0.5);",
      "vUv2 = r * vUv2 + vec2(0.5);",
      "vUv2 = vUv2 * 0.25 + vUv * 0.25;",

      "vec4 colorMap = texture2D(map, vUv2, -1.0);",
      "vec3 causticsMap = texture2D(caustics, vec2((vWorld.x)/12.+uTime/32., (vWorld.z-vWorld.y)/12.)).rgb;",

      "gl_FragColor = vec4(causticsMap, 1.0) * colorMap;",
      // "gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);",
    "}"
  ].join("\n");

  this.transparent = true;
  this.blending = THREE.AdditiveBlending;

};

THREE.PlanktonShader.prototype = Object.create(THREE.ShaderMaterial.prototype);

THREE.Plankton = function(globals){

  THREE.PointCloud.call( this );

  this.globals = globals;

  var scope = this;

  this.geometry = new THREE.BufferGeometry();

  var count = 200;
  var positions = new Float32Array( count * 3 );
  var uv = new Float32Array( count * 2 );

  for ( i = 0; i < count; i += 1 ) {
    positions[ i * 3 ]     = 20 * Math.random() - 10;
    positions[ i * 3 + 1 ] = 20 * Math.random() - 10;
    positions[ i * 3 + 2 ] = 20 * Math.random() - 10;
    uv[ i * 2 ] = Math.floor(4 * Math.random());
    uv[ i * 2 + 1 ] = Math.floor(4 * Math.random());
  }

  this.geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
  this.geometry.addAttribute( 'uv', new THREE.BufferAttribute( uv, 2 ) );
  this.geometry.computeBoundingSphere();

  this.sortParticles = false;

  this.material = new THREE.PlanktonShader(globals);

  this.update = function() {
    if (scope.material) {
      scope.material.uniforms.caustics.value = caustics[parseInt(this.globals.time*30 % 33)];
      scope.material.uniforms.uTime.value = this.globals.time;
      scope.material.uniforms.uPointSize.value = this.globals.uPointSize;
      scope.material.uniforms.uTurb.value = this.globals.uTurb;
    }
  };

};

THREE.Plankton.prototype = Object.create( THREE.PointCloud.prototype );