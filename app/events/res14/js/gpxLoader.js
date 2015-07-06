var GpxLoader = function() {
  
  var xhttp = new XMLHttpRequest();
  xhttp.overrideMimeType('text/xml');

  this.onTrackLoaded = function() {};

  this.loadTracks = function(path) {

    xhttp.open('GET', path, false);
    xhttp.send(null);

    var trackList = JSON.parse(xhttp.responseText);

    for (var i = 0; i < trackList.tracks.length; i++) {
      this.loadTrack(trackList.tracks[i]);
    }

  };

  this.loadTrack = function(path) {

    // console.log("Loading... " + path);

    xhttp.open('GET', path, false);
    xhttp.send(null);

    var data = JSON.parse(xhttp.responseText);
    var points = data.points;
    var date = points[0][0];

    var line = this.createLine(points);
    line.name = date;

    this.onTrackLoaded(line);

  };


  this.createLine = function(points) {

    var material = new THREE.LineBasicMaterial();
    var geometry = new THREE.BufferGeometry();

    var pos = new THREE.Vector2(0,0);
    var prevPos = new THREE.Vector2(0,0);

    geometry.addAttribute( 'position', Float32Array, points.length * 3 * 2, 3 );
    var position = geometry.attributes.position.array;
    var dist;

    geometry.computeBoundingSphere();
    geometry.boundingSphere.center.count = 0;
    geometry.boundingSphere.radius = 1;

    for ( var i = 0; i < points.length; i ++ ) {

      pos.set(points[i][1], points[i][2]);
      dist = pos.distanceTo(prevPos);

      if (dist < 1) {

        geometry.boundingSphere.center.x += pos.x;
        geometry.boundingSphere.center.y += pos.y;
        geometry.boundingSphere.center.count += 1;

        position[i * 6 + 0] = prevPos.x;
        position[i * 6 + 1] = prevPos.y;
        position[i * 6 + 3] = pos.x;
        position[i * 6 + 4] = pos.y;

      }

      prevPos.copy(pos);

    }

    geometry.boundingSphere.center.multiplyScalar(1/geometry.boundingSphere.center.count);

    var line = new THREE.Line( geometry, material, THREE.LinePieces );

    return line;

  };

};