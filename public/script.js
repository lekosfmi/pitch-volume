const SceneManager = function(ctx){
  this.waves = [];
  this.hue = 100;
  this.sat = 10;
  this.lum = 1;
  this.opacity = 1;
  this.msgOpacity = 1;
  this.started = true;

  //button handlers
  this.mouseOff = () => { }

  this.mouseHover = mouse => { }

  this.mouseClick = mouse => {
    this.started = true
    this.createWave(mouse.x, mouse.y)
  }

  this.createWave = (centerX, centerY) => {
    const wave = new Wave(ctx, centerX, centerY);
    wave.init();
    this.waves.push(wave);
  }

    this.destroyWave = function(index){
      this.waves.splice(index, 1);
    }

  this.update = function(){
    if(this.started){
      this.msgOpacity -= 0.05;
    }
    for(var i = 0; i < this.waves.length; i++){
      this.waves[i].update();
      if(this.waves[i].ripples.length === 0){
        this.destroyWave(this.waves[i]);
      }
    }
  }

  this.render = function(){
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.textAlign="start";
    ctx.fillStyle = "hsla("+this.hue+", "+this.sat+"%, "+this.lum+"%, "+this.opacity+")";
    ctx.fillRect(0,0,canvasWidth, canvasHeight);
    ctx.strokeStyle = "#ff69b4";
    ctx.moveTo(5, 25);
    ctx.lineTo(250, 25);
    ctx.moveTo(20, 5);
    ctx.lineTo(20, 250);
    ctx.font = "15px Arial";
    ctx.strokeText('+', 240, 20);
    ctx.strokeText('+', 5, 240);
    ctx.font = "32px Arial";
    ctx.textAlign="center";
    ctx.fillStyle= "hsla(100, 255%, 255%,"+ this.msgOpacity+ " )";
    ctx.stroke();
    ctx.closePath();
    for(var i = 0; i < this.waves.length; i++){
      this.waves[i].render();
    }
  }
}

const Wave = function(ctx, cx, cy) {
  this.ripples = [];
  this.rippleSpeed = 1.4;
  this.rippleCount = 6;

  this.init = () => {
    for(let i = 1; i < this.rippleCount +1 ; i++){
      let decay = Math.pow(this.rippleSpeed, i);
      let ripple = new Ripple(ctx, cx, cy, this.rippleSpeed, decay);
      ripple.init();
      this.ripples.push(ripple);
    }
    this.ripples[0].sound.play();
  }

  this.destroyRipple = index => this.ripples.splice(index, 1);

  this.update = () => {
    for (let i = 0; i < this.ripples.length; i++){
      this.ripples[i].update();
      if (this.ripples[i].killMe){
        this.destroyRipple(i);
      }
    }
  }

  this.render = function() {
    for (var i = 0; i < this.ripples.length; i++) {
      this.ripples[i].render();
    }
  }
}

const Ripple = function(ctx, cx, cy, r, decay) {
  this.radius = 1;
  this.shadowRadius = 10;
  this.rSpeed = r;
  this.decay = decay;
  this.lineWidth = 1;
  this.epicenterX = cx;
  this.epicenterY = cy;
  this.sound;
  this.killMe = false;
  this.opacity = 1;

  this.init = () => this.createSound();

  this.createSound = () => {
    this.sound = new Pizzicato.Sound({
      source: 'wave',
      options: {
        volume: this.epicenterY / canvasHeight,
        frequency: this.epicenterX
      }
    });

    let delay = new Pizzicato.Effects.DubDelay({
      feedback: 0.5,
      time: 0.7,
      mix: 0.5,
      cutoff: 500
    });

    this.sound.addEffect(delay);
  }

  this.update = () => {
    this.rDelta = this.rSpeed * this.decay;
    this.radius += this.rDelta;
    this.shadowRadius += this.rDelta;

    if (this.radius > 10) { this.sound.stop() }
    if (this.lineWidth > 1) { this.lineWidth -= 0.30*this.decay }
    if (this.radius > 250 && this.opacity > 0){ this.opacity -= 0.1 }
    if (this.radius > 1000) { this.killMe = true }
  }

  this.render = function(){
    ctx.beginPath();
    ctx.lineWidth = this.lineWidth + 20;
    ctx.strokeStyle = "hsla(330, 100%, 71%, "+this.opacity+")";
    ctx.arc(this.epicenterX,this.epicenterY,this.shadowRadius,0,2*Math.PI);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.lineWidth = this.lineWidth;

    ctx.strokeStyle = "hsla(255, 255%, 255%, "+this.opacity+")";
    ctx.arc(this.epicenterX, this.epicenterY, this.radius, 1, 100*Math.PI);
    ctx.stroke();
    ctx.closePath();
  }
}

// LIFECYCLE
var frames = 0;
function update() {
	frames++;
	sm.update();

	// render
	render();
}

function render() {

	// clear
	context.clearRect(0, 0, canvasWidth, canvasHeight);

	sm.render();

	requestAnimationFrame(update);

}

// DEFINITIONS
var canvas = document.getElementById('mainCanvas');
var context = canvas.getContext('2d');
var canvasWidth = canvas.width = window.innerWidth;
var canvasHeight = canvas.height = window.innerHeight;
var currentFrame = 0;
var mouseX = -1;
var mouseY = -1;
var isMousePressed = false;

var sm = new SceneManager(context);


window.onresize = function(){
	canvasWidth = canvas.width = window.innerWidth;
	canvasHeight = canvas.height = window.innerHeight;
}

function onMouseMove(evt) {
	mouseX = evt.clientX;
	mouseY = evt.clientY;
}

function onMouseDown(evt) {
	isMousePressed = true;
}

function onMouseUp(evt) {
	isMousePressed = false;
	sm.mouseClick(evt);
}

canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mouseup", onMouseUp);

requestAnimationFrame(update);
