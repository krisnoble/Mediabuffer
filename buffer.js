/*!  
 *  buffer.js
 *  @version 1.0
 *  @author Kris Noble - http://simianstudios.com
 *  @license MIT 
 */ 
/* 
 *  Buffer an HTML5 audio/video file for 
 *  (hopefully) uninterrupted playback
 * 
 *  http://github.com/krisnoble/Buffer
 * 
 *  Adapted under the MIT license from code by Denis Nazarov:
 *  https://github.com/denisnazarov/canplaythrough
 */

function Buffer(element, progressCallback, readyCallback) {
	
	this.element = element;
	this.progressCallback = progressCallback;
	this.readyCallback = readyCallback;
	
	this.loadStartTime = 0; 
	this.percentBuffered = 0;
	this.previousPercentBuffered = 0;
	
	this.element.setAttribute('data-vol', this.element.volume); // store for later
	this.element.volume = 0; // mute to avoid issues from chromeBugWorkaround()
	
	this.element.preload = "auto";
	
	this.boundProgress = this.progress.bind(this);
	
	this.element.addEventListener('progress', this.boundProgress, true);
}

Buffer.prototype.progress = function() {
	if(this.loadStartTime === 0) {
		this.loadStartTime = new Date().valueOf();
	}
	
	var currentTime = new Date().valueOf();
	var numberOfTimeRangesLoaded = this.element.buffered.length;
	if(numberOfTimeRangesLoaded > 0) {
		var duration = this.element.duration;
		var secondsLoaded = this.element.buffered.end(0);
		var elapsedTime = (currentTime - this.loadStartTime) / 1000; // in seconds
		var downloadRate = elapsedTime / secondsLoaded;
		var secondsToLoad = duration - secondsLoaded;
		var estimatedRemainingDownloadSeconds = secondsToLoad * downloadRate;

		if(secondsLoaded > estimatedRemainingDownloadSeconds) {
			this.element.removeEventListener('progress', this.boundProgress, true);
			this.element.volume = this.element.getAttribute('data-vol'); // restore from muted
			this.readyCallback();
		} else {
			this.percentBuffered = Math.round((secondsLoaded/estimatedRemainingDownloadSeconds) * 100);
			if(this.percentBuffered > this.previousPercentBuffered) {
				this.progressCallback(this.percentBuffered);
				this.previousPercentBuffered = this.percentBuffered;			
			}
			this.chromeBugWorkaround();
		}
	}
};

Buffer.prototype.chromeBugWorkaround = function() {
	this.element.play();  // workaround for Chrome bug
	this.element.pause(); // https://code.google.com/p/chromium/issues/detail?id=111281
	this.element.currentTime = 0;
};