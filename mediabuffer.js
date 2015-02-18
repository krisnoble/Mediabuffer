/*!  
 *  mediabuffer.js
 *  @version 1.0
 *  @author Kris Noble - http://simianstudios.com
 *  @license MIT 
 */ 
/* 
 *  Buffer an HTML5 audio/video file for 
 *  (hopefully) uninterrupted playback
 * 
 *  http://github.com/krisnoble/Mediabuffer
 * 
 *  Adapted under the MIT license from code by Denis Nazarov:
 *  https://github.com/denisnazarov/canplaythrough
 */

var mbDebug = true;

function Mediabuffer(element, progressCallback, readyCallback) {if(mbDebug){ console.log('mediabuffer init'); }
	this.element = element;
	this.progressCallback = progressCallback;
	this.readyCallback = readyCallback;

	this.loadStartTime = 0; 
	this.percentBuffered = 0;
	this.previousPercentBuffered = 0;

	this.element.setAttribute('data-vol', this.element.volume); // store for later
	this.element.volume = 0; // mute to avoid issues from chromeBugWorkaround()

	this.element.preload = "auto";
	this.element.load();

	this.boundProgress = this.progress.bind(this);

	this.element.addEventListener('progress', this.boundProgress, true);
}

Mediabuffer.prototype.progress = function() {
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
		if(mbDebug){ console.log('mediabuffer d= ' + duration + ' / sL= ' + secondsLoaded + ' / eT= ' + elapsedTime + ' / dR= ' + downloadRate + ' / sTL= ' + secondsToLoad + ' / eRDS= ' + estimatedRemainingDownloadSeconds); }	
		if((elapsedTime > 0 || secondsToLoad === 0 ) && secondsLoaded > estimatedRemainingDownloadSeconds) {
			this.destroy(false);
			this.readyCallback();
		} else if (elapsedTime > 0){
			this.percentBuffered = Math.round((secondsLoaded/estimatedRemainingDownloadSeconds) * 100);
			if(this.percentBuffered > this.previousPercentBuffered) {
				this.progressCallback(this.percentBuffered);
				this.previousPercentBuffered = this.percentBuffered;			
			}
			this.chromeBugWorkaround();
		}
	}
};

Mediabuffer.prototype.chromeBugWorkaround = function() {
	this.element.play();  // workaround for Chrome bug
	this.element.pause(); // https://code.google.com/p/chromium/issues/detail?id=111281
	this.element.currentTime = 0;
};

Mediabuffer.prototype.destroy = function(stopPreloading) {
	this.element.removeEventListener('progress', this.boundProgress, true);
	this.element.volume = this.element.getAttribute('data-vol'); // restore from muted
	this.element.removeAttribute('data-vol');
	if(stopPreloading) {
		this.element.preload = "none";
		this.element.load();
	}
};
