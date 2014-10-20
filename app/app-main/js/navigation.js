var navigation;
var page = [];

function Navigation(){

  this.setHash = function(hash){
    window.location.hash = hash;
    animateCameraToLabel(hash);
  };

  this.clearHash = function(){
    history.pushState("", document.title, window.location.pathname);
  };


  this.goToHash = function(){
    var hash = window.location.hash.replace("#", "");
    if (page[hash]) animateCameraToLabel(hash);
  };

  this.goToHash();

}

navigation = new Navigation();

window.onhashchange = function(){
  navigation.goToHash();
  trackHash();
};