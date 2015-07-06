## Adding polymer to the mix
First, make sure both platform.js and polymer.js are laoded:
```
<script src="lib/platform.js"></script>
<script src="lib/polymer.js"></script>
```
Before accessing any polymer.js elements, make sure polymer is ready. You can do that by wrapping your application in a polymer element itself or waiting for the polymer-ready event to fire.
```javascript
window.addEventListener('polymer-ready', function(){
  // do stuff with polymer here
});
```
We will hook up `<three-outliner>`, `<three-attribute-editor>` and `<three-viewport-controls>` elements.

To better understand how elements work, check out the [barebone element template](https://github.com/arodic/res14/blob/master/elements/element-template.html) and break down the [elements' sources](https://github.com/arodic/res14/tree/master/lib) 

## Wraping the app as an element
```
<polymer-element name="main-app">
  <link rel="stylesheet" href="main-app.css" />
  <template>
      <three-outliner id="outliner"></three-outliner>
      <three-attribute-editor id="attributes"></three-attribute-editor>
      <three-viewport-controls id="controls"></three-viewport-controls>
    <content>
    </content>
  </template>
  <script src="main-app.js"></script>
</polymer-element>
```
