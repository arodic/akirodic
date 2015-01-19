/**
 * Created by PyCharm.
 * User: akira
 * Date: 3/3/13
 * Time: 9:49 PM
 * To change this template use File | Settings | File Templates.
 */
function initScene(){
  scene = new THREE.Scene();

  light['sphere'] = new THREE.HemisphereLight( 0xffddee, 0x229988, 1.0 );
  scene.add(light['sphere']);
  light['ambient'] = new THREE.AmbientLight(0x000000);
  scene.add(light['ambient']);

  // TEXTURES / MATERIALS
  texture['wall'] = new THREE.ImageUtils.loadTexture("./models/wall.jpg");
  material['wall'] = new THREE.MeshLambertMaterial({color: 0xFFFFFF, map: texture['wall']});
  texture['cube'] = new THREE.ImageUtils.loadTexture("./models/cube.jpg");
  material['cube'] = new THREE.MeshLambertMaterial({color: 0xffffff, map: texture['cube']});
  material['cubeGreen'] = new THREE.MeshLambertMaterial({color: 0x000000, emissive: 0x44ff77, map: texture['cube']});
  material['cubeRed'] = new THREE.MeshLambertMaterial({color: 0xFF0000, emissive: 0xff4477, map: texture['cube']});
  material['cubeActive'] = new THREE.MeshLambertMaterial({color: 0xFFFFFF, emissive: 0x44ff77, map: texture['cube']});
  material['line'] = new THREE.LineBasicMaterial( { color: 0xffffff, transparent: true, opacity: 1, linewidth: 1 } );
  material['wireCube'] = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, wireframe: true, wireframeLinewidth: 1, opacity: 0.25});
  material['wireWall'] = new THREE.ShaderMaterial({
    uniforms: {
      phase: { type: "f", value: wirePhase }
    },
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
    transparent: true,
    blending: THREE.AdditiveBlending,
    wireframe: true
  });

  // MODELS
  var loader = new THREE.ColladaLoader();
  loader.load( './models/scene.dae', function ( collada ) {
    object['scene'] = collada.scene;
    scene.add(object['scene']);
    object['scene'].children[0].children[1].material = material['wall'];

    var wireframe = object['scene'].children[0].children[1].clone();
    wireframe.material = material['wireWall'];
    wireframe.scale.set(0.99,0.99,0.99);
    wireframe.position.y = 0.1;
    object['scene'].children[0].add(wireframe);

    clickable = object['scene'].children[0].children[0].children;
    for (var i in clickable) {
      clickable[i].material = clickable[i].material2 = material['cube'];
    }

    // LABELS
    {
      newPage('about', [0.2,0.85,0.5], [1,0.51], 0.805, 3.455);
      newPage('blog', [-0.45,0.8,0.2], [1,1.2], 1.2, 2.2);
      newPage('contact', [0.65,0.85,-0.1], [1,0.6], -0.132, -2.305);
      newPage('portfolio', [-0.2,1.35,-0.40], [1,1.2], 1.174, 1.1859);
    }

    {
      addCallback('about', function(){navigation.setHash('about');});
      addCallback('blog', function(){navigation.setHash('blog');});
      addCallback('contact', function(){navigation.setHash('contact');});
      addCallback('portfolio', function(){navigation.setHash('portfolio');});
      addCallback('lightswitch', function(){
        animateAmbientDarkness([-0.8, -0.4, -0.3]);
        tracking('easter egg', 'light off');
      });
      addCallback('hide', function(){
        for (var i in clickable){
          clickable[i].visible = false;
          if (clickable[i].wire) clickable[i].wire.visible = false;
          if (clickable[i].line) clickable[i].line.visible = false;
          object['scene'].children[0].children[1].material.map = new THREE.ImageUtils.loadTexture("./models/wall_no_shadow.jpg");
          material['wall'] = new THREE.MeshLambertMaterial({color: 0xFFFFFF, map: texture['wall']});
        }
        for (var j in page){
          page[j].label.visible = false;
          page[j].line.visible = false;
        }
        tracking('easter egg', 'hide all');
      });
    }

    setTimeout(initNavigation, 100);

  });
}

function newPage(name, pos, size, tilt, orbit) {
  page[name] = new THREE.Object3D;
  page[name].tilt = tilt;
  page[name].orbit = orbit;
  page[name].position.set(pos[0],pos[1],pos[2]);
  scene.add(page[name]);

  page[name].label = new THREE.Mesh(
          new THREE.PlaneGeometry(0.7, 0.09,1,1),
          new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            doubleSided: true,
            transparent: true,
            map: new THREE.ImageUtils.loadTexture("images/"+name+".png")
          })
  );
  page[name].add(page[name].label);

  var scale = 8;
  page[name].html = document.getElementById(name);
  page[name].html.style.overflow = 'scroll'; //WTF?
  page[name].html.style.width = size[0]*100*scale+'px';
  page[name].html.style.height = size[1]*100*scale+'px';

  page[name].content = new THREE.CSS3DObject(page[name].html);
  page[name].content.position.set(0,-size[1]/2-0.07,0);
  page[name].content.scale = new THREE.Vector3(0.01/scale,0.01/scale,1);
  page[name].label.add(page[name].content);

  for (var i in clickable){
    if (clickable[i].name == name) {
      // WIREFRAME
      clickable[i].material = clickable[i].material2 = material['cubeGreen'];
      clickable[i].wire = clickable[i].clone();
      clickable[i].wire.material = material['wireCube'];
      clickable[i].wire.scale.multiplyScalar(1.01);
      object['scene'].add(clickable[i].wire);

      // LINE
      var geometry = new THREE.Geometry();
      geometry.vertices.push( clickable[i].position.clone().multiplyScalar(0.01) );
      geometry.vertices.push( new THREE.Vector3( pos[0],pos[1]-0.05,pos[2] ) );
      var mat = material['line'];
      page[name].line = new THREE.Line(geometry, mat);
      scene.add(page[name].line);
    }
  }

}

function addCallback(name, callback){
  for (var i in clickable){
    if (clickable[i].name == name) {
      clickable[i].callback = callback;
    }
  }
}