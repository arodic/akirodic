function bindTouch(element, callback, event){
  addListener(element, event, callback);
}

function bindTouchStart(element, callback, event){
  addListener(element, 'touchstart', callback);
  addListener(element, 'mousedown', callback);
}

function bindTouchMove(element, callback, event){
  addListener(element, 'touchmove', callback);
  addListener(element, 'mousemove', callback);
}

function bindTouchEnd(element, callback, event){
  addListener(element, 'touchend', callback);
  addListener(element, 'mouseup', callback);
}

function getTouch(event){
  if (event.touches)
    return event.touches[0];
  else
    return event;
}

function addListener(element, event, handler){
  element.addEventListener(event, handler, false);
}