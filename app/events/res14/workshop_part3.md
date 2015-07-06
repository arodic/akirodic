## Generating line geometry from GPS data

**Resources:**  
[Free GPX Data](http://wiki.openstreetmap.org/wiki/Planet.gpx)  

The following script converts a directory with GPX files into JSON format more suitable for javascript parsing:  
**[GPX -> JSON conversion script](https://github.com/arodic/res14/blob/master/data/convert.py)**

#### Drawing a line with custom geometry
```javascript
var material = new THREE.LineBasicMaterial({ color: "white", linewidth: 1 });
var geometry = new THREE.BufferGeometry();

geometry.addAttribute( 'position', Float32Array, 20 * 3, 3 );
var position = geometry.attributes.position.array;

for ( var i = 0; i < 20; i ++ ) {
  position[i * 3 + 0] =  Math.random()*10;
  position[i * 3 + 1] =  Math.random()*10;
  position[i * 3 + 2] =  Math.random()*10;
}

geometry.computeBoundingSphere();

var line = new THREE.Line( geometry, material );
```

Note that [THREE.Line](https://github.com/mrdoob/three.js/blob/master/src/objects/Line.js) takes optional type parameter such as `THREE.LinePieces`.

#### Load point data with a xhttp request
```javascript
var xhttp = new XMLHttpRequest();
xhttp.overrideMimeType('text/xml');

xhttp.open('GET', path, false);
xhttp.send(null);

var data = JSON.parse(xhttp.responseText);
var points = data.points;
```
