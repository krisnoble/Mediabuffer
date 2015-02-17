#Buffer

Buffer an HTML5 audio/video file for (hopefully) uninterrupted playback.

Native JavaScript, no dependencies.

Released under the MIT license, based on [code by Denis Nazarov](https://github.com/denisnazarov/canplaythrough).

##Usage
```javascript
var example = new Buffer(element, progressCallback, readyCallback);
```

###element
The `<audio>` or `<video>` element you want to buffer e.g. `document.getElementById('example')`. The media source should be defined before initialising Buffer using the element's `src` attribute or child `<source>` elements.

###progressCallback
Function to run as the media buffers. Takes a single parameter, `percentBuffered` which you can use to provide feedback to the user as the file buffers.

###readyCallback
Function to run when the file is buffered. You'll probably want to use the element's `play()` function here

##Example

```javascript
function progress(percentBuffered) {
	console.log('Buffering: ' + percentBuffered + '%');
}

function ready() {
	console.log('Ready!');
	document.getElementById('example').play();
}

var audioBuffer = new Buffer(document.getElementById('example'), progress, ready);
```

##Browser Compatibility
TODO

##Known issues
* Chrome has [an annoying ~~bug~~feature](https://code.google.com/p/chromium/issues/detail?id=111281) that means it won't buffer past a certain point without a [workaround](https://code.google.com/p/chromium/issues/detail?id=111281#c82). That's OK except that if you have controls visible they won't work as the user may expect and it can cause them to flicker between states. If you want to enable controls your best bet is to have them hidden initially and then show them in your `readyCallback`.
