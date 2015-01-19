// created by Craig Buckler http://www.sitepoint.com/html5-full-screen-api/

var pfx = ["webkit", "moz", "ms", "o", ""];
  function RunPrefixMethod(obj, method) {
    var p = 0, m, t;
    while (p < pfx.length && !obj[m]) {
      m = method;
      if (pfx[p] == "") {
        m = m.substr(0,1).toLowerCase() + m.substr(1);
      }
      m = pfx[p] + m;
      t = typeof obj[m];
      if (t != "undefined") {
        pfx = [pfx[p]];
        return (t == "function" ? obj[m]() : obj[m]);
      }
      p++;
    }
  }

function initFullscreen(){
  var e = document.getElementById("fullScreen");
  if (platform.mobile()) e.style.display = 'none';
  if (e) e.onclick = function() {
    RunPrefixMethod(document.getElementById("container"), "RequestFullScreen");
  }
}
