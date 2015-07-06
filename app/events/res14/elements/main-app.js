(function(){

  Polymer('main-app', {
    renderer: new THREE.WebGLRenderer({devicePixelRatio: 1}),
    camera: new THREE.PerspectiveCamera(35, 1, 0.1, 1000),
    scene: new THREE.Scene(),
    ready: function() {

      var scope = this;

      this.scene.add(this.camera);
      this.camera.position.z = 10;

      this.$.attributes.model = this.scene;

      var gpxLoader = new GpxLoader();
      gpxLoader.onTrackLoaded = function(line) {
        scope.scene.add(line);
      };
      gpxLoader.loadTracks('data/trackList.json');

      this.shadowRoot.appendChild(this.renderer.domElement);

      var resize = function() {
        scope.renderer.setSize(window.innerWidth, window.innerHeight);
        scope.camera.aspect = (window.innerWidth / window.innerHeight);
        scope.camera.updateProjectionMatrix();
      };

      resize();

      var render = function() {
        setTimeout(function(){
          requestAnimationFrame(render);
          scope.renderer.render(scope.scene, scope.camera);
        },1000/60);
      };

      render();

      window.addEventListener('resize', resize);


    }
  });

})();