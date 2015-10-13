var domready = require('domready');

var EventEmitter = require('wolfy87-eventemitter');

var app = function(){
	console.log('Application loaded');

	this.init();
};

var proto = app.prototype = new EventEmitter();


// PAPEr
//
//


var leftPath = new Path({
  strokeColor : 'red',
  opacity:0.5,
	strokeJoin: 'round',
	strokeCap: 'round'
});

var rightPath = new Path({
  strokeColor : 'green',
  opacity:0.5,
	strokeJoin: 'round',
	strokeCap: 'round'
});


proto.amount = 8;

proto.scale = 4;
proto.step = view.size.width / ( (proto.amount * proto.scale) + 1);


for( var i = 0; i <= (proto.amount * proto.scale); i++ ){
  leftPath.add( new Point( i * proto.step, 0 ));
  rightPath.add( new Point( i * proto.step, 0 ));
}

var group = new Group({
	children: [leftPath, rightPath],
	transformContent: false,
	strokeWidth: 30,
	strokeJoin: 'round',
	strokeCap: 'round',
	pivot: leftPath.position,
	position: view.center
});

proto.context = new webkitAudioContext();
proto.isPlaying = false;

proto.oscillator = proto.context.createOscillator();
proto.source = proto.context.createBufferSource();

proto.analyserL;
proto.analyserR;

// Create the buffer to receive the analyzed data.

proto.createAnalyzer = function(){
  this.analyserL = this.context.createAnalyser();
  this.analyserR = this.context.createAnalyser();

  this.analyserL.smoothingTimeConstant = 0.5;
  this.analyserL.fftSize = 512;//Math.pow(2, proto.amount) * 2;

  this.analyserR.smoothingTimeConstant = this.analyserL.smoothingTimeConstant;
  this.analyserR.fftSize = this.analyserL.fftSize; 

  this.freqByteData = new Uint8Array(this.analyserL.frequencyBinCount);

  this.splitter = this.context.createChannelSplitter();

  this.source.connect( this.splitter );
  this.splitter.connect( this.analyserR, 0, 0 );
  this.splitter.connect( this.analyserL, 1, 0 );

  this.source.connect( this.context.destination );

};

proto.createOscillator = function(){  
  this.oscillator.type = 0; // sine wave
  this.oscillator.frequency.value = 40;
  this.oscillator.connect( this.splitter );
};

proto.init = function(){
  this.createAnalyzer();
  this.createOscillator();

  this.playButton = document.getElementById('play');
  this.stopButton = document.getElementById('stop');

  this.addListeners();
  this.loop();
};

proto.mx = proto.my = 0;

proto.playButton;
proto.stopButton;

proto.isMouseDown = false;

proto.addListeners = function(){
  document.body.onmousemove = this.onmousemove.bind(this);
  document.body.onmouseout = document.body.onmouseup = this.onmouseout.bind(this);

  document.body.onkeypress = this.onkeypress.bind(this);

  this.playButton.onclick = this.play.bind(this);
  this.stopButton.onclick = this.stop.bind(this);
};

proto.play = function(){
    this.isPlaying = true
    this.oscillator.start();
};

proto.stop = function(){
    this.isPlaying = false
    this.oscillator.stop();
};

proto.onmousemove = function( event ){
  this.mx = event.pageX;
  this.my = event.pageY;
};

proto.onmousedown = function( event ){
  if (!this.isMouseDown){
    this.isMouseDown = true;
    this.oscillator.start();
  }
};

proto.onmouseup = proto.onmouseout = function( event ){
  if (this.isMouseDown){
    this.isMouseDown = false;
    this.oscillator.stop();
  }
};

proto.onkeypress = function(){
  switch(event.keyCode){
    case(122):
      this.oscillator.type = 'sine';
      break;

    case(120):
      this.oscillator.type = 'square';
      break;

    case(99):
      this.oscillator.type = 'sawtooth';
      break;

    case(118):
      this.oscillator.type = 'triangle';
      break;

    default:
      console.log(event.keyCode);
  }
}



proto.getEqualizerBands = function(data) {
	var bands = [];

	var amount = Math.sqrt(data.length) / 2;
	
  for(var i = 0; i < amount; i++) {
		var start = Math.pow(2, i) - 1;
		var end = start * 2 + 1;
		var sum = 0;
		for (var j = start; j < end; j++) {
			sum += data[j];
		}
		var avg = sum / (255 * (end - start));
		bands[i] = Math.sqrt(avg / Math.sqrt(2));
	}
	
  return bands;
}

proto.drawLine = function(){
  var step = view.size.width / ((proto.amount * proto.scale) + 1);
  var scale = view.size.height / 2.25;
  var flip = false;

  this.analyserL.getByteFrequencyData(this.freqByteData);
  var leftBands = this.getEqualizerBands( this.freqByteData, true);

  this.analyserR.getByteFrequencyData(this.freqByteData);
  var rightBands = this.getEqualizerBands( this.freqByteData, true);

  console.log(rightBands);

	for (var i = 1; i <= proto.amount * proto.scale; i++) {
    //console.log(i % proto.amount);
    
    leftPath.segments[i].point = [(i * step) - 1, -leftBands[ i % proto.amount] * scale];
    rightPath.segments[i].point = [(i * step) - 1, Math.sin(-rightBands[ i % proto.amount ]) * scale * (flip ? -1 : 1)];
	}

  //leftPath.smooth();
  rightPath.smooth();
	//group.pivot = [leftPath.position.x, 0];
	//group.position = view.center;
}

proto.loop = function(){
  window.requestAnimationFrame( this.loop.bind(this) );

  this.drawLine();

  if (this.isPlaying){
    this.oscillator.frequency.value = this.mx;
    this.oscillator.detune.value = this.my;
  }
}

var onload = function(){
	new app();
};


domready(onload);
