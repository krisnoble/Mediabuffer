/*!  
 *  buffer.js
 *  @version 1.0
 *  @author Kris Noble - http://simianstudios.com
 *  @license MIT 
 */ 
/* 
 *  Buffer an HTML5 media file for 
 *  (hopefully) uninterrupted playback
 * 
 *  http://github.com/krisnoble/Buffer
 * 
 *  Adapted under the MIT license from code by Denis Nazarov:
 *  https://github.com/denisnazarov/canplaythrough
 */

var element, 
	progressCallback, 
	readyCallback, 
	loadStartTime = 0, 
	percentBuffered,
	previousPercentBuffered = 0;

function buffer(e, p, r) {
	
	element = e;
	progressCallback = p;
	readyCallback = r;
	
	element.setAttribute('data-vol', element.volume); // store for later
	element.volume = 0; // mute to avoid issues from chromeBugWorkaround()
	
	element.preload = "auto";
	
	element.addEventListener('progress', progress, true);
}

function progress() {
	if(loadStartTime === 0) {
		loadStartTime = new Date().valueOf();
	}
	
	var currentTime = new Date().valueOf();
	var numberOfTimeRangesLoaded = element.buffered.length;
	if(numberOfTimeRangesLoaded > 0) {
		var duration = element.duration;
		var secondsLoaded = element.buffered.end(0);
		var elapsedTime = (currentTime - loadStartTime) / 1000; // in seconds
		var downloadRate = elapsedTime / secondsLoaded;
		var secondsToLoad = duration - secondsLoaded;
		var estimatedRemainingDownloadSeconds = secondsToLoad * downloadRate;

		if(secondsLoaded > estimatedRemainingDownloadSeconds) {
			element.removeEventListener('progress', progress, true);
			element.volume = element.getAttribute('data-vol'); // restore from muted
			readyCallback();
		} else {
			percentBuffered = Math.round((secondsLoaded/estimatedRemainingDownloadSeconds) * 100);
			if(percentBuffered > previousPercentBuffered) {
				progressCallback(percentBuffered);
				previousPercentBuffered = percentBuffered;			
			}
			chromeBugWorkaround();
		}
	}
}

function chromeBugWorkaround() {
	element.play();  // workaround for Chrome bug
	element.pause(); // https://code.google.com/p/chromium/issues/detail?id=111281
	element.currentTime = 0;
}