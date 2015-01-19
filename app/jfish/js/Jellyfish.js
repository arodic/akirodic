// TODO: move
var caustics = [];
for (var i = 0; i < 32; i++) {
  var f = i;
  if (f < 10) f = '0'+f;
  caustics[i] = THREE.ImageUtils.loadTexture('images/caustics/caustics7.' + f + '.jpg');
  caustics[i].wrapS = THREE.RepeatWrapping;
  caustics[i].wrapT = THREE.RepeatWrapping;
}

THREE.JellyfishShader = function(globals) {

  THREE.ShaderMaterial.call(this);

  this.globals = globals;

  this.attributes = {
    weight: { type: 'v4', value: null }
  };

  this.uniforms = {
    "uFogTopCol": { type: "c", value: globals.uFogTopCol || new THREE.Color(0.8,0.8,0.8)},
    "uFogBottomCol": { type: "c", value: globals.uFogBottomCol ||new THREE.Color(0.2,0.2,0.2)},
    "uFogPower": { type: "f", value: 1},

    "uLightPos": { type: "v4", value: new THREE.Vector4(0,50,0,100)},
    "uLightCol": { type: "v4", value: new THREE.Vector4(1,1,1,2)},

    "uNear": { type: "f", value: 0},
    "uFar": { type: "f", value: 1},

    "map": { type: "t", value: THREE.ImageUtils.loadTexture('images/jellyfish.png') },
    "caustics": { type: "t", value: caustics[0]},
    "uTime": { type: "f", value: 0},
    "jTime": { type: "f", value: 0},

    "uJoint0": { type: "m4", value: new THREE.Matrix4().identity()},
    "uJoint1": { type: "m4", value: new THREE.Matrix4().identity()},
    "uJoint2": { type: "m4", value: new THREE.Matrix4().identity()},
    "uJoint3": { type: "m4", value: new THREE.Matrix4().identity()},
    "uJoint0InvTranspose": { type: "m4", value: new THREE.Matrix4().identity()},
  };

  this.vertexShader = [      
    "attribute vec4 weight;",

    "uniform vec3 uFogTopCol;",
    "uniform vec3 uFogBottomCol;",

    "uniform vec4 uLightPos;",
    "uniform vec4 uLightCol;",

    "uniform float jTime;",
    "uniform mat4 uJoint0;",
    "uniform mat4 uJoint1;",
    "uniform mat4 uJoint2;",
    "uniform mat4 uJoint3;",
    "uniform mat4 uJoint0InvTranspose;",

    "varying vec3 vFogColor;",
    "varying vec3 vWorld;",
    "varying vec3 vNormal;",
    "varying vec3 vDiffuse;",
    "varying vec2 vUv;",


    "void main() {",

      "float dpi = 6.2831853;",
      "float pi = 3.14159265;",
      "float hpi = 1.570796325;",
      "float time = mod(jTime+position.z, dpi);",

      "float offset = smoothstep(0.0,1.,max(0.,-position.z-0.8)/10.);",
      "vec3 anim = (vec3(color.x,color.y,color.z)/8.0*sin(time) * (1.-offset))*2.0;",
      "vec3 pos = position + anim;",

      "pos = vec3(uJoint0 * vec4(pos, 1.0))*weight.x +",
      "vec3(uJoint1 * vec4(pos, 1.0))*weight.y +",
      "vec3(uJoint2 * vec4(pos, 1.0))*weight.z +",
      "vec3(uJoint3 * vec4(pos, 1.0))*weight.w;",

      "vNormal = normalize(vec3(uJoint0InvTranspose * vec4(normal, 1.0)));",

      // position, eye, depth
      "vWorld = pos;",
      "vec4 WorldViewProj = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );",
      "vec3 eye = normalize( vWorld - cameraPosition );",
      
      // Fog
      "float dotProduct = abs(dot( eye, vec3(0.,1.,0.) ));",
      "dotProduct = ( 2.0 * dotProduct + 1.0) / 2.0;",
      "vFogColor = mix(uFogBottomCol, uFogTopCol, dotProduct);",

      // diffuse
      "vec3 lightDir = normalize(uLightPos.rgb - vWorld.xyz);",
      "float diffuseProduct = max(dot(vNormal, lightDir), 0.0);",
      "float lightFalloff = pow(max(1.0-(distance(uLightPos.rgb, vWorld.xyz)/uLightPos.a), 0.0),2.0);",
      "vDiffuse = uLightCol.rgb * vec3(diffuseProduct * lightFalloff * uLightCol.a);",

      "gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );",

      "vUv = uv;",

    "}"

  ].join("\n");
  this.fragmentShader = [
    "uniform float uTime;",
    "uniform sampler2D map;",
    "uniform sampler2D caustics;",

    "uniform float uNear;",
    "uniform float uFar;",
    "uniform float uFogPower;",

    "varying vec3 vFogColor;",
    "varying vec3 vWorld;",
    "varying vec3 vNormal;",
    "varying vec3 vDiffuse;",
    "varying vec2 vUv;",
    "void main() {",

      "vec3 causticsMap = texture2D(caustics, vec2((vWorld.x)/12.+uTime/32., (vWorld.z-vWorld.y)/12.)).rgb;",
      "causticsMap.rgb = pow(causticsMap.rgb, vec3(2.2));",

      "vec4 colorMap = texture2D(map, vUv, -1.0);",
      "colorMap = pow(colorMap, vec4(2.2));",

      "float depth = gl_FragCoord.z / gl_FragCoord.w / (uFar - uNear);",

      "vec3 finalColor = colorMap.rgb * (vDiffuse + causticsMap);", // + uAmbientCol TODO

      "finalColor = pow(finalColor, vec3(0.454545));",
      
      // "finalColor = mix(finalColor, vFogColor, 1.0 - colorMap.a);", // alpha fog
      // "finalColor = mix(finalColor, vFogColor, pow(depth, uFogPower));", // distance fog
      "gl_FragColor =  vec4(finalColor, colorMap.a);",
      // "gl_FragColor =  vec4(vDiffuse, 1.0);",

    "}"

        // vec3 ambient = uAmbientCol.rgb * uAmbientCol.a;

        // vec4 composit = vec4(((vDiffuse + caustics*uLightCol.a + ambient)*colorMap.rgb) + vFresnel, colorMap.a);  
    
        // vec4 biolumMap = texture2D(uSampler2, vec2(vTextureCoord.s, vTextureCoord.t), -1.0);

        // float cycleMap = biolumMap.a;
        // float bio0 = sin((-cycleMap - 0.1 - jTime/5.0))*biolumMap.r*10.0;  
        // float bio1 = sin((-cycleMap - 0.7 - jTime/5.0))*biolumMap.g*10.0;
        // float bio2 = sin((-cycleMap - 2.5 - jTime/5.0))*biolumMap.b*10.0;
        
        // float bioFresnel = vFresnel.r+vFresnel.g+vFresnel.b * cos((1.6 + jTime/5.0))*2.0;
        // float bioDim = sin((cycleMap + jTime)*0.3)*0.5;  
        // vec3 biolum = colorMap.rgb * bioDim * max(bio0+bio1+bio2+bioFresnel,0.0);
  
        // vec3 l = vec3(vDiffuse + ambient);  

        // //mix with fog
        // composit.rgb = mix(composit.rgb, vFogCol.rgb, vFogCol.a);
        // composit.rgb = mix(composit.rgb, composit.rgb+biolum, pow(1.0-(l.r+l.g+l.b)/3.0,3.0));
  
        // if (uShaderDebug == 1.0) {composit = vec4(vDiffuse,1.0);}//diffuse
        // else if (uShaderDebug == 2.0) {composit = vec4(vSpecular,1.0);}//specular
        // else if (uShaderDebug == 3.0) {composit = vec4(vFresnel,1.0);}//fresnel
        // else if (uShaderDebug == 4.0) {composit = vec4(ambient,1.0);}//ambient
        // else if (uShaderDebug == 5.0) {composit = vec4(caustics.rgb,1.0);}//caustics
        // else if (uShaderDebug == 6.0) {composit = vec4(colorMap.rgb,1.0);}//color
        // else if (uShaderDebug == 7.0) {composit = vec4(vec3(colorMap.a),1.0);}//transparency
        // else if (uShaderDebug == 8.0) {composit = vec4(biolum,1.0);}//bioluminescence


        // gl_FragColor = composit;
  ].join("\n");

  this.side = THREE.DoubleSide;
  this.transparent = true;
  this.vertexColors = true;

};

(function(){

var jMass = 0.1;
var jDamping = 0.1;

var force = new THREE.Vector3();
var forceNorm = new THREE.Vector3();
var accel = new THREE.Vector3();
var velocity = new THREE.Vector3();
var tempVec3 = new THREE.Vector3();
var tempMat4 = new THREE.Matrix4();
var tempFloat;

THREE.JellyfishShader.prototype = Object.create(THREE.ShaderMaterial.prototype);

THREE.Jellyfish = function(globals){

  THREE.Object3D.call( this );

  this.globals = globals;

  var scope = this;

  var xhrLoader = new THREE.XHRLoader();

  xhrLoader.load( 'meshes/jellyfish3.json', function(response) {
    var data = JSON.parse(response);

    var vertexPositions = new Float32Array( data.vertexPositions );
    var vertexNormals = new Float32Array( data.vertexNormals );
    var vertexColors = new Float32Array( data.vertexColors );
    var vertexTextureCoords = new Float32Array( data.vertexTextureCoords );
    var indices = new Uint16Array( data.indices );

    // Rotate to Z
    var m = new THREE.Matrix4().makeRotationFromEuler( new THREE.Euler( Math.PI / 2, Math.PI, 0 ) );
    m.applyToVector3Array( vertexPositions );
    m.applyToVector3Array( vertexNormals );
    m.applyToVector3Array( vertexColors );

    var vertexWeigthData = [];
    for(var i=0; i<vertexPositions.length; i=i+3){
      var z = vertexPositions[i+2];      
      var w0 = Math.cos(Math.min(Math.max((z+0.3), -Math.PI),0)) / 2 + 0.5;
      var w1 = Math.cos(Math.min(Math.max((z+0.3+Math.PI), -Math.PI),Math.PI)) / 2 + 0.5;
      var w2 = Math.cos(Math.min(Math.max((z+0.3+2*Math.PI), -Math.PI),Math.PI)) / 2 + 0.5;
      var w3 = Math.cos(Math.min(Math.max((z+0.3+3*Math.PI), -Math.PI),Math.PI)) / 2 + 0.5;
      // var w0 = Math.max(Math.min(1-((-z-0.3)/Math.PI),1.0),0.0);
      // var w1 = Math.max(Math.min(1-((-z-Math.PI-0.3)/Math.PI),1+((-z-Math.PI-0.3)/Math.PI)),0.0);
      // var w2 = Math.max(Math.min(1-((-z-Math.PI*2-0.3)/Math.PI),1+((-z-Math.PI*2-0.3)/Math.PI)),0.0);
      // var w3 = Math.max(Math.min(1-((-z-Math.PI*3-0.3)/Math.PI),1+((-z-Math.PI*3-0.3)/Math.PI)),0.0);
      vertexWeigthData.push(w0);
      vertexWeigthData.push(w1);
      vertexWeigthData.push(w2);
      vertexWeigthData.push(w3);
    }
    var vertexWeigth = new Float32Array( vertexWeigthData );

    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) );
    geometry.addAttribute( 'position', new THREE.BufferAttribute( vertexPositions, 3 ) );
    geometry.addAttribute( 'normal', new THREE.BufferAttribute( vertexNormals, 3 ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( vertexColors, 3 ) );
    geometry.addAttribute( 'weight', new THREE.BufferAttribute( vertexWeigth, 4 ) );
    geometry.addAttribute( 'uv', new THREE.BufferAttribute( vertexTextureCoords, 3 ) );


    scope.mesh = new THREE.Mesh( geometry, new THREE.JellyfishShader(globals) );
    scope.add( scope.mesh );

    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();

  });

  this.size = globals.size || 1;

  this.direction = new THREE.Vector3(0,1,0);
  
  this.target = new THREE.Mesh(
    new THREE.CylinderGeometry(0,0.2,1,4,1,true),
    new THREE.MeshBasicMaterial()
  );
  this.target.geometry.applyMatrix( new THREE.Matrix4().makeRotationFromEuler( new THREE.Euler( Math.PI / 2, Math.PI, 0 ) ) );

  this.bone = [];
  this.bone[0] = this.target;
  this.bone[1] = new THREE.AxisHelper();
  this.bone[2] = new THREE.AxisHelper();
  this.bone[3] = new THREE.AxisHelper();
  this.bone[4] = new THREE.AxisHelper();

  this.target.position.z = 2;
  this.bone[1].position.z = -0.3;
  this.bone[2].position.z = -0.3 - 1 * Math.PI;
  this.bone[3].position.z = -0.3 - 2 * Math.PI;
  this.bone[4].position.z = -0.3 - 3 * Math.PI;

  this.bone[1].updateMatrix();
  this.bone[2].updateMatrix();
  this.bone[3].updateMatrix();
  this.bone[4].updateMatrix();

  this.bone[1].bindMatrix = new THREE.Matrix4().getInverse(this.bone[1].matrix);
  this.bone[2].bindMatrix = new THREE.Matrix4().getInverse(this.bone[2].matrix);
  this.bone[3].bindMatrix = new THREE.Matrix4().getInverse(this.bone[3].matrix);
  this.bone[4].bindMatrix = new THREE.Matrix4().getInverse(this.bone[4].matrix);

  this.bone[1].skinMatrix = new THREE.Matrix4();
  this.bone[2].skinMatrix = new THREE.Matrix4();
  this.bone[3].skinMatrix = new THREE.Matrix4();
  this.bone[4].skinMatrix = new THREE.Matrix4();

  this.bone[1].InvTransposeMatrix = new THREE.Matrix4();

  this.bone[1].length = 2.3;
  this.bone[2].length = Math.PI;
  this.bone[3].length = Math.PI;
  this.bone[4].length = Math.PI;

  this.bone[1].stiffness = 0.2;
  this.bone[2].stiffness = 0.005;
  this.bone[3].stiffness = 0.0025;
  this.bone[4].stiffness = 0.00125;

  this.add(this.target);
  this.add(this.bone[1]);
  this.add(this.bone[2]);
  this.add(this.bone[3]);
  this.add(this.bone[4]);

  this.update = function() {

    this.target.lookAt(tempVec3.copy(this.target.position).add(this.direction));

    // TODO: penalize alignment with eye vector
    tempVec3.set( Math.random()*0.02-0.01, Math.random()*0.02-0.01, 0 );
    this.direction.add(tempVec3);
    
    tempFloat = this.target.position.length();
    tempVec3.copy(this.target.position).normalize().multiplyScalar(-0.0001*tempFloat);
    this.direction.add(tempVec3);

    this.direction.normalize();

    var prop = (Math.cos(this.globals.time+2.3)/2+0.22)*3; // TODO
    this.target.position.add( tempVec3.copy(this.direction).multiplyScalar(0.01*prop) );

    for (var i = 1; i < 5; i++) {
      force.copy(this.bone[i-1].position).sub(this.bone[i].position);
      forceNorm.copy(force).normalize().multiplyScalar(this.bone[i].length * this.size);
      force.sub(forceNorm).multiplyScalar(this.bone[i].stiffness);
      accel.copy(force).multiplyScalar(1/jMass);
      // accel.y -= 0.05;
      velocity.copy(force).add(accel).multiplyScalar(jDamping / this.size);
      this.bone[i].position.add(velocity);
      this.bone[i].scale.set(this.size,this.size,this.size);
    }

    this.bone[1].up.copy(this.bone[1].position).sub(this.globals.camera.position).multiplyScalar(-1);
    this.bone[2].up.copy(this.bone[2].position).sub(this.globals.camera.position).multiplyScalar(-1);
    this.bone[3].up.copy(this.bone[3].position).sub(this.globals.camera.position).multiplyScalar(-1);
    this.bone[4].up.copy(this.bone[4].position).sub(this.globals.camera.position).multiplyScalar(-1);
    this.bone[1].lookAt(this.target.position);
    this.bone[2].lookAt(this.bone[1].position);
    this.bone[3].lookAt(this.bone[2].position);
    this.bone[4].lookAt(this.bone[3].position);

    if (scope.mesh) {
      scope.mesh.material.uniforms.uNear.value = this.globals.camera.near;
      scope.mesh.material.uniforms.uFar.value = this.globals.camera.far;
      scope.mesh.material.uniforms.uFogPower.value = this.globals.uFogPower;
      scope.mesh.material.uniforms.caustics.value = caustics[parseInt(this.globals.time*30 % 33)];
      scope.mesh.material.uniforms.jTime.value = this.globals.time;
      scope.mesh.material.uniforms.uTime.value = this.globals.time;
      
      scope.mesh.material.uniforms.uLightPos.value = this.globals.uLightPos;
      scope.mesh.material.uniforms.uLightCol.value = this.globals.uLightCol;

      //TODO: cleanup
      tempMat4.multiplyMatrices(this.bone[1].matrix, this.bone[1].bindMatrix);
      this.bone[1].InvTransposeMatrix.getInverse(tempMat4);
      this.bone[1].InvTransposeMatrix.transpose();
      scope.mesh.material.uniforms.uJoint0InvTranspose.value = this.bone[1].InvTransposeMatrix;

      scope.mesh.material.uniforms.uJoint0.value = this.bone[1].skinMatrix.multiplyMatrices(this.bone[1].matrix, this.bone[1].bindMatrix);
      scope.mesh.material.uniforms.uJoint1.value = this.bone[2].skinMatrix.multiplyMatrices(this.bone[2].matrix, this.bone[2].bindMatrix);
      scope.mesh.material.uniforms.uJoint2.value = this.bone[3].skinMatrix.multiplyMatrices(this.bone[3].matrix, this.bone[3].bindMatrix);
      scope.mesh.material.uniforms.uJoint3.value = this.bone[4].skinMatrix.multiplyMatrices(this.bone[4].matrix, this.bone[4].bindMatrix);
    }
  };

};

THREE.Jellyfish.prototype = Object.create( THREE.Object3D.prototype );

}());