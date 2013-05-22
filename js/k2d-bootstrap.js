///////////////////////////////////////////////////////////////////////////////
// K2D-Bootstrap.js: Small bootstrapping library for javascript game development
// Only features basic fonctionnalities :
//  - A game structure
//  - A ressource cache for images -> loading screen
//  - Small management of effects (example is shown with fade-in/fade-out)
//  - Sprite animations
//  - Easy keyboard/mouse management
//  - Viewport. Well, sort of
//  - Easy drawing/writing with the screen class
//  - A Timer class for dealing with time management
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// Keyboard constants
///////////////////////////////////////////////////////////////////////////////
const KB_UP = 38;
const KB_DOWN = 40;
const KB_LEFT = 37;
const KB_RIGHT = 39;
const KB_ESCAPE = 27;
const KB_ENTER = 13;

///////////////////////////////////////////////////////////////////////////////
// A bunch of drawing utilities. See usage
// Yep, its not pretty clean.
///////////////////////////////////////////////////////////////////////////////
Screen = function (engine){
	this.context = engine.context;
}

Screen.prototype.drawRect = function (px, py, sizex, sizey, col, alpha){
	if (alpha != undefined)
	{
		this.context.save ();
		this.context.globalAlpha = alpha;
	}
	this.context.fillStyle = col;
	this.context.beginPath();
	this.context.rect(px, py, sizex, sizey);
	this.context.closePath();
	this.context.fill();
	if (alpha != undefined)
	{
			this.context.restore ();
	}
}

Screen.prototype.drawText = function (text, x, y, color, font){
	this.context.fillStyle = color;
	this.context.font = font;
	this.context.textAlign = "left";
	this.context.fillText(text, x, y);
}

// Draw a centered text around the x position
Screen.prototype.drawCenterText = function (text, x, y, color, font){
	this.context.fillStyle = color;
	this.context.font = font;
	this.context.textAlign = "center";
	this.context.textBaseline = "top";
	this.context.fillText(text, x, y);
}

Screen.prototype.clear = function(color){
	this.drawRect(0,0, GAME_WIDTH, GAME_HEIGHT, color);
}

///////////////////////////////////////////////////////////////////////////////
// Datacache: Basic management of a resource cache.
// Allow the loading of ressources during a loading screen, where
// a progress bar can be displayed
// Todo : have a more OO system
///////////////////////////////////////////////////////////////////////////////
DataCache = function ()
{
	this.nbDone = 0;

	this.imageQueue = [];
	this.imageCache = {};
	
	this.soundQueue = [];
	this.soundCache = {};
}

DataCache.prototype.done = function (){
	return this.nbDone == this.imageQueue.length;
};

// Computes the percentage of what has been downloaded
DataCache.prototype.Percentage = function (){
	var res = 1.0;
	if (this.imageQueue.length != 0)
		res = this.nbDone/this.imageQueue.length;
		
	return res; 
}

DataCache.prototype.getImage = function(img){
	return this.imageCache[img];
}

DataCache.prototype.getSound = function(img){
	return this.soundCache[img];
}

DataCache.prototype.load = function (){
	this.loadImages ();	
	this.loadSound ();	
}

DataCache.prototype.loadImages = function (){
	for (i = 0; i < this.imageQueue.length; i++)
	{
		var src = "images/" + this.imageQueue[i] + ".png";
		var img = new Image ();
		img.src = src;
		var that = this;
		img.addEventListener("load", function() {
			that.nbDone += 1;
		}, false);
		this.imageCache[this.imageQueue[i]] = img;
	}
}

DataCache.prototype.loadSound = function (){
	for (i = 0; i < this.soundQueue.length; i++)
	{
		var src = "audio/" + this.soundQueue[i] + ".mp3";
		var img = new Audio (src);
		this.soundCache[this.soundQueue[i]] = img;
	}
}

///////////////////////////////////////////////////////////////////////////////
// SpriteSheet: handles sprite animations
///////////////////////////////////////////////////////////////////////////////
var SpriteSheet = function (nbStates, nbImagesPerAnimation, stepDuration, textureName){
	this.nbStates = nbStates;
	this.nbImages = nbImagesPerAnimation;
	this.stepDuration = stepDuration;
	this.textureName = textureName;
	
	this.loopAnimation = true; // Dit s'il faut recommencer l'animtion une fois terminé ou non
	
	this.currState = 0;
	this.currAnimation = 0;
	
	this.IsAnimated = true;
	this.TimerStart = Date.now();
}

SpriteSheet.prototype.Draw  = function(datacache, viewport, x, y, sX, sY){
	var image = datacache.getImage(this.textureName);
	var sizeX = image.width/this.nbImages;
	var sizeY = image.height/this.nbStates;
	var displaySizeX = (sX == undefined) ? sizeX : sX;
	var displaySizeY = (sY == undefined) ? sizeY : sY;

	// 1st parameter : the image to display
	// the next 2 : position in the image to start displaying from
	// the next 2 : number of pixels to display
	// the next 2 : position where to draw in the canvas
	// the last 2 : size of the image in the canvas
	viewport.context.drawImage(image, this.currAnimation*sizeX, this.currState*sizeY, sizeX, sizeY, x-viewport.x, y-viewport.y, displaySizeX, displaySizeY);
}

SpriteSheet.prototype.SetAnimated = function(b){
	if (this.IsAnimated && b){
		// Rien a faire 
	}
	else if (b){
		this.IsAnimated = true;
		this.TimerStart = Date.now();
	}
	else
	{
		this.IsAnimated = false;
	}
}

SpriteSheet.prototype.SetAnimation = function(a){
	this.currAnimation = a;
}

SpriteSheet.prototype.SetState = function(s){
	this.currState = s;
}

SpriteSheet.prototype.Animate = function(){
	duration = Date.now() - this.TimerStart;
	if (this.IsAnimated)
	{
		var idx = Math.floor(duration / this.stepDuration) % this.nbImages;
		if (idx > this.nbImages){
			idx = idx % this.nbImages;
		}
		this.currAnimation = idx;
	}
}

///////////////////////////////////////////////////////////////////////////////
// FadeEffect: handles how to display and animate fade-in and fade-out effects
///////////////////////////////////////////////////////////////////////////////
var FadeEffect = function (params){
	this.FADE_IN = 0;
	this.FADE_OUT = 0;

	this.color = params.color;
	this.duration = params.duration;
	this.elapsed = 0;
	this.fadeType = params.fadeType;
	
	this.done = false;
	
	this.Update = function (dt){
		this.elapsed += dt;
		if (this.elapsed > this.duration){
			this.done = true;
		}
	}
	
	this.Draw = function (ctx){
		ctx.fillStyle= this.color;
		if (this.fadeType == this.FADE_IN)
			ctx.globalAlpha=this.elapsed/this.duration;
		else
			ctx.globalAlpha=1-this.elapsed/this.duration;
		ctx.fillRect(0,0,GAME_WIDTH,GAME_HEIGHT);
		ctx.globalAlpha=1;
	}
}

///////////////////////////////////////////////////////////////////////////////
// Viewport management class
///////////////////////////////////////////////////////////////////////////////
Viewport = function(engine){
	this.context = engine.context;
}

Viewport.prototype = {
	x : 0, 
	y : 0
}

Viewport.prototype.DrawSprite = function (name, x, y, w, h)
{
	img = g_DataCache.getImage(name);
	if (img != null)
		this.context.drawImage(img, x - this.x, y-this.y, w, h);
}

///////////////////////////////////////////////////////////////////////////////
// Timer class
///////////////////////////////////////////////////////////////////////////////
Timer = function(){
}

Timer.prototype = {
	t0 : 0,
	tf : 0
}

Timer.prototype.Start = function ()
{
	this.t0 = Date.now();
	this.tf = 0;
}

Timer.prototype.Stop = function ()
{
	this.tf = Date.now();
}


// Returns the elapsed's duration (in ms) since last "Start"'s call
Timer.prototype.Elapsed = function ()
{
	var now = this.tf == 0 ? Date.now() : this.tf;
	var dt = (now-this.t0);
	return dt;
}

// Returns true if the duration (in ms) is elapsed since last "Start"'s call
Timer.prototype.IsElapsed = function (duration)
{
	var dt = this.Elapsed();
	return (duration < dt);
}

// Converts the elapsed duration in a string
Timer.prototype.ChronoString = function ()
{
	var tot_s = (this.Elapsed()*0.001); // Converts in seconds
	var nb_min = tot_s > 59 ? Math.floor(tot_s/60) : 0;
	var str_minutes = nb_min < 10 ? "0" + nb_min : nb_min;
	var nb_s = ((tot_s)%60);
	return str_minutes + ":" + nb_s.toFixed(2); // 2 digits for the milliseconds
}

///////////////////////////////////////////////////////////////////////////////
// Engine class, the entry point of the application
///////////////////////////////////////////////////////////////////////////////
K2DEngine = function(params){
	this.currState = "loading";
	
	this.datacache = params.datacache || {};	
	this.states = params.states || {};
	this.width = params.width || 320;		// todo: replace with default value
	this.height = params.height || 200;		// todo: replace with default value
	this.stateAfterLoading = params.stateAfterLoading ||  "menu"
	that = this;
	
	this.canvas = document.createElement("canvas");
	this.context = this.canvas.getContext("2d");
	
	this.screen = new Screen (this);

	this.mouseCursor = {x:0, y:0};
}

K2DEngine.prototype = {
	currState : "loading",
	stateAfterLoading : "",
	dataCache: {},
	keysDown: {},
	effects : [],
	canvas : {},
	context : {},
	mouseCursor : {x:0, y:0}
}

K2DEngine.prototype.AddState = function (name, state){
	this.states[name] = state;
}

K2DEngine.prototype.ChangeState = function (state){
	// Call 2 triggers if they exist (OnLeaveState on the current state, and OnEnterState on the next state)
	if (this.states[this.currState] != undefined && this.states[this.currState].OnLeaveState != undefined){
		this.states[this.currState].OnLeaveState ({nextState:state});
	}
	if (this.states[state] != undefined && this.states[state].OnEnterState != undefined){
		this.states[state].OnEnterState ({previousState:this.currState});
	}
	this.currState = state;
}

K2DEngine.prototype.Init = function (options){
	// Creates the drawing area
	this.canvas.width = this.width; 
	this.canvas.height = this.height;

	document.body.appendChild(this.canvas);
	
	addEventListener("keydown", function (e) {
		that.keysDown[e.keyCode] = true;
	}, false);

	addEventListener("keyup", function (e) {
		delete that.keysDown[e.keyCode];
	}, false);
	
	window.onkeydown = that.KeyPress;
	window.onmousedown = that.MouseClick;
	window.onmousemove = that.MouseMove;
	
	// Initializes the game
	prevDate = Date.now();
	
	this.datacache.load();
	
	setInterval(this.GameLoop, 1);
}

K2DEngine.prototype.Update = function (modifier){
	if (this.currState == "loading")
	{
		if (this.datacache.done() == true)
			this.currState = this.stateAfterLoading;
	}
	else{
		var st = this.states[this.currState];
		if (st.Update)
			st.Update(modifier);
	}
		
		
	this.UpdateEffects(modifier);
}

// Drawing method. 
K2DEngine.prototype.Draw = function(){
	if (this.currState == "loading")
		that.RenderLoadingScreen();
	else
		this.states[this.currState].Draw();
	
	// Display the effects ()
	for (i = 0; i < that.effects.length; i++){
		that.effects[i].Draw (that.context);
	}
}
	
// The main game loop
K2DEngine.prototype.GameLoop = function () {
	var now = Date.now();
	var delta = now - prevDate;

	that.screen.clear("rgb(0,0,0)"); // Todo : move this line away
	that.Update(delta / 1000);
	that.Draw();

	prevDate = now;
};

// Handles the keypress events, and delegates to the current state (if necessary)
K2DEngine.prototype.KeyPress = function (event) {
	// If the current states implements a method "HandleEvent", we call this method
	if (that.currState != "loading"){
		var st = that.states[that.currState];
		if (st.KeyPress)
		{
			st.KeyPress(event);
		}
	}
}

// Handles the mouse click events, and delegates to the current state (if necessary)
K2DEngine.prototype.MouseClick = function (event) {
	// If the current states implements a method "HandleEvent", we call this method
	var st = that.states[that.currState];
	if (st.MouseClick != undefined)
	{
		st.MouseClick(event);
	}
}

// Handles the Mouse move events, and delegates to the current state (if necessary)
K2DEngine.prototype.MouseMove = function (event) {
	// Update the cursor
	// todo :  does not seem to handle correctly the mouse coords 
	// when the page is scrolled
	that.mouseCursor = 
	{
		x : event.clientX-document.documentElement.scrollLeft-that.canvas.offsetLeft,
		y : event.clientY-document.documentElement.scrollTop-that.canvas.offsetTop
	};

	// If the current states implements a method "HandleEvent", we call this method
	var st = that.states[that.currState];
	if (st.MouseMove != undefined)
	{
		st.MouseMove(event);
	}
}

K2DEngine.prototype.UpdateEffects = function(dt){
	for (i = 0; i < this.effects.length; i++){
		this.effects[i].Update(dt);
		if (this.effects[i].done){
			this.effects.splice (i,1);
		}
	}
}


K2DEngine.prototype.RenderLoadingScreen = function(){
	that.screen.drawRect (0,0, GAME_WIDTH, GAME_HEIGHT, "#d0e7f9");
	that.screen.drawCenterText ("" + that.datacache.Percentage()*100 + " %", GAME_WIDTH/2, GAME_HEIGHT/2, "red", "30pt Calibri");
}
