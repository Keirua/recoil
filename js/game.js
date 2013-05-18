// Heavily based on http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
var GAME_WIDTH = 640;
var GAME_HEIGHT = 480;

var NB_X_BLOC = 20;
var NB_Y_BLOC = 15;

var BLOC_SIZE = 32;
var PLAYER_SIZE = 8;

var SPEED_X =  2; // movement in pixels per second
var MAX_SPEED_X =  0.5;
var G = 1;

var MAX_TRAIL_QUEUE = 15;
var TIME_BETWEEN_TRAIL = 15; // 50ms between 2 additions of blocks

var DOG_SIZE = 120;

var BLOCK = {
	NONE : 0,
	WALL : 1,
	DESTROYABLE : 2, 
	EXPLODE : 3,
	ROCKET : 4, 			// There might be 2 kinds of rockets 
	PLAYER_START : 5 			// There might be 2 kinds of rockets 
};

//Create a sound 
// /!\ Does not work in firefox
// dog : http://crackberry.com//ringtone/duck-hunt-dog-laugh-annoying-dog
// explosion : http://www.freesound.org/people/inferno/sounds/18384/
// bounce : http://soundbible.com/1626-Ball-Bounce.html
var dog_laugh = new Audio("audio/duck-hunt-dog-laugh-ringtone.mp3");
dog_laugh.loop = false;
var sound_explosion = new Audio("audio/18384__inferno__largex.mp3");
// var sound_bounce = new Audio("audio/Ball_Bounce-Popup_Pixels-172648817.mp3");
var sound_bounce = new Audio();

g_DataCache = new DataCache();

Object.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (i in this) {
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i]
  } return newObj;
};

var level = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,4,3,2,2,0,0,0,0,0,0,0,0],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
// See https://www.youtube.com/watch?v=NQaCpD5w8vQ for other levels
var level0 = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1]
];

var level1 = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,1,1,1,1,1,2,2,0,2,2,2,0,2,2,2,2,2,2,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1]
];

var level2 = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
	[1,5,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
	[1,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1]
];

var level3 = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,5,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,1,1,1,3,0,0,0,0,0,0,0],
	[1,1,1,1,1,3,3,1,1,1,1,1,1,1,1,1,3,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
];

var levels = [
	level0,
	level1,
	level2,
	level3
]

// level = level1;


g_DataCache.queue = [
	"bloc1",
	"bloc2",
	"bloc3",
	"bloc4",
	"dog"
];

var dogSprite = new SpriteSheet(1, 2, 200, "dog");
dogSprite.SetState (0);
dogSprite.SetAnimated(true);
dogSprite.Animate();

///////////////////////////////////////////////////////////////////////////////
// Menu state
///////////////////////////////////////////////////////////////////////////////
MenuState = function() {}

MenuState.prototype = {
	activeItem : 0,
	menuItems : [
		"Play",
		"Options",
		"Credit",
	]
}

MenuState.prototype.Update = function (modifier) {
	// The event handling is done in the keypress event
};
	
MenuState.prototype.Draw = function(){
	// Background
	g_Screen.drawRect (0,0, GAME_WIDTH, GAME_HEIGHT, "#d0e7f9");
	
	// Display the Title
	g_Screen.drawText ("Recoil", 32,32, "rgb(0, 250, 250)", "26px Helvetica");
	g_Screen.drawText ("Cache : " + g_DataCache.queue.length, 32,64, "rgb(0, 250, 250)", "26px Helvetica");
	
	// Display the menu
	for (i = 0; i < this.menuItems.length; i++)
	{
		var str = this.menuItems[i];
		var col = "red";
		
		if (this.activeItem == i){
			col = "green";
			str = "[ " + this.menuItems[i] + " ]";
		}
		g_Screen.drawCenterText (str, GAME_WIDTH/2, GAME_HEIGHT/2 + 50 * (i), col, "30pt Calibri");
	}
}

MenuState.prototype.KeyPress = function(event){
	if (event.keyCode == KB_ENTER) {	// Pressing "enter"
		if (this.activeItem == 0){
			gameEngine.ChangeState("game");

			gameEngine.effects.push ( new FadeEffect ("rgb(255, 255, 255)", 0.3, false) );
		}
		else if (this.activeItem == 2)
		{
			gameEngine.ChangeState("credit");
			creditState.Init();
			gameEngine.effects.push ( new FadeEffect ("rgb(255, 255, 255)", 0.3, false) );
		}
	}
	if (event.keyCode == KB_UP) { // Player holding up
		// bullet_sound.play();
		this.activeItem = (this.activeItem-1);
		if (this.activeItem < 0)
			this.activeItem = this.menuItems.length-1;
	}
	if (event.keyCode == KB_DOWN) { // Player holding down
		// bullet_sound.play();
		this.activeItem = (this.activeItem + 1) % (this.menuItems.length);
	}
}

///////////////////////////////////////////////////////////////////////////////
// Game state
///////////////////////////////////////////////////////////////////////////////
CreditState = function(){
	this.timer = new Timer();
}

CreditState.prototype = {
	pos : GAME_HEIGHT - 100,
	active:false
}

CreditState.prototype.Init = function (){
	this.active = true;
	this.timer.Start();
}

CreditState.prototype.Update = function (dt) {
	if (KB_ESCAPE in gameEngine.keysDown) {
		gameEngine.ChangeState("menu");
		this.active = false;
	}
}

CreditState.prototype.Draw = function () {
	// g_Screen.drawCenterText ("Yay !", GAME_WIDTH/2, this.pos - this.timer.Elapsed()*0.001*20, "rgb(0, 250, 250)", "24px Helvetica");
	// g_Screen.drawText ("" + this.timer.ChronoString(), 100, 100, "rgb(0, 250, 250)", "24px Helvetica");
}

///////////////////////////////////////////////////////////////////////////////
// Editor state
///////////////////////////////////////////////////////////////////////////////

EditorState = function(){
	this.viewport = new Viewport(gameEngine);
}


EditorState.prototype = {
	currElem : 0
}

EditorState.prototype.Draw = function (modifier) {
	// gameEngine.states['game'].DrawLevel(level);
	//Displays a potential future block if necessary
	if (this.currElem != 0){
		cell = getCell(gameEngine.mouseCursor);
		drawBlock(cell.x*BLOC_SIZE, cell.y*BLOC_SIZE, this.currElem);
	}
}

EditorState.prototype.KeyPress = function(event){
	var c = event.keyCode;

	if (event.keyCode == KB_ENTER) {	// Pressing "enter"
		// gameEngine.states['game'].Init();
		gameEngine.ChangeState("game");

		// console.log (JSON.stringify (level));
	}
	// Buttons 0 ... 4 of the keyboard
	if (c >= 48 && c <= 52){
		this.currElem = event.keyCode - 48; 
	}
}

EditorState.prototype.MouseClick = function(event){
	// Add the block to the level if necessary	
	cell = getCell(gameEngine.mouseCursor);
	console.log(gameEngine.mouseCursor);

	// level[cell.y][cell.x] = this.currElem;
}


///////////////////////////////////////////////////////////////////////////////
// Game object
///////////////////////////////////////////////////////////////////////////////
GameInfo = function(){
	this.levelTimer = new Timer ();
}

GameInfo.prototype = {
	currLevelIndex : 3,
	currDeath : 0,
	totalDeath : 0,
	levelTimer: {}
}

g_gameInfo = new GameInfo();

///////////////////////////////////////////////////////////////////////////////
// Death state
///////////////////////////////////////////////////////////////////////////////

DeathState = function(){
	this.dog = new DogEffect (1.5);
}

DeathState.prototype.Update = function (modifier) {
	this.dog.Update (modifier);
}

DeathState.prototype.Draw = function (modifier) {
	gameEngine.screen.context.save ();
	gameEngine.screen.context.globalAlpha = 0.3;

	gameEngine.states['game'].DrawLevel (gameEngine.states['game'].currLevel);
	gameEngine.screen.context.restore ();

	g_Screen.drawCenterText ("Death", GAME_WIDTH/2, GAME_HEIGHT/2-50, "grey", "24pt Calibri");
	g_Screen.drawCenterText ('x ' + g_gameInfo.currDeath, GAME_WIDTH/2, GAME_HEIGHT/2, "#eee", "18pt Calibri");
	
	this.dog.Draw();
}

DeathState.prototype.KeyPress = function(event){
	if (event.keyCode == KB_ENTER) {	// Pressing "enter"
		gameEngine.states['game'].InitGame();
		gameEngine.ChangeState("game");
		dog_laugh.pause();
		dog_laugh.currentTime = 0;
	}
}


///////////////////////////////////////////////////////////////////////////////
// ExplosionEffect: handles how to display the explosion effect when ones die
///////////////////////////////////////////////////////////////////////////////
var ExplosionEffect = function (color, duration, pos, nbParticles){
	this.color = color;
	this.duration = duration;
	this.elapsed = 0;
	
	this.done = false;

	this.particles = [];
	this.nbParticles = nbParticles;
	for (var i = 0; i < nbParticles; ++i){
		this.particles.push ({
			pos : {
				x: pos.x,
				y: pos.y
			},
			speed : {
				x : Math.random ()-0.5,
				y : -Math.random ()*0.5
			},
			size : 1+(Math.random ()*(5-1))
		});
	}

	this.Update = function (dt){
		this.elapsed += dt;
		if (this.elapsed > this.duration){
			this.done = true;
		}
		var level = gameEngine.states["game"].currLevel;
		for (var i = 0; i < this.nbParticles; ++i){
			var currParticle = this.particles[i];
			var newPos = {
				x : currParticle.pos.x + currParticle.speed.x * dt * 200,
				y : currParticle.pos.y + currParticle.speed.y * dt * 200
			}
			
			var currCell = getCell (currParticle.pos);
			var newCell = getCell (newPos);

			if (hasCollision (level, newCell))  {
				if (newCell.y > currCell.y)
					currParticle.speed.y *= -1;
				if (newCell.x != currCell.x)
					currParticle.speed.x *= -1;
			}
			// Update particle position
			currParticle.pos.x = newPos.x;
			currParticle.pos.y = newPos.y;
			// Add gravity
			currParticle.speed.y += G * dt;
		}
	}
	
	this.Draw = function (ctx){
		ctx.save ();
		ctx.globalAlpha = 1-this.elapsed/this.duration;
		ctx.fillStyle = this.color;

		for (var i = 0; i < this.nbParticles; ++i){
			var currParticle = this.particles[i];
			ctx.fillRect(currParticle.pos.x,currParticle.pos.y,currParticle.size,currParticle.size);
		}

		ctx.restore ();
	}
}



///////////////////////////////////////////////////////////////////////////////
// BlockDisappearEffect: make 4 blocks slide when a block is destroyed
///////////////////////////////////////////////////////////////////////////////
var BlockDisappearEffect = function (color, duration, pos, nbSubdivisions){
	this.color = color;
	this.duration = duration;
	this.elapsed = 0;
	
	this.done = false;

	this.particles = [];
	this.nbParticles = nbSubdivisions*nbSubdivisions;
	this.size = BLOC_SIZE/nbSubdivisions;

	for (var i = 0; i < nbSubdivisions; ++i){
		for (var j = 0; j < nbSubdivisions; ++j){
			var offset = this.size;
			this.particles.push ({
				pos : {
					x: pos.x + i*offset,
					y: pos.y + j*offset
				},
				ySpeed : Math.random ()
			});
		}
	}

	this.Update = function (dt){
		this.elapsed += dt;
		if (this.elapsed > this.duration){
			this.done = true;
		}

		for (var i = 0; i < this.nbParticles; ++i){
			var currParticle = this.particles[i];
			var yNewPos = currParticle.pos.y + currParticle.ySpeed * dt * 100
			
			// Update particle position
			currParticle.pos.y = yNewPos;
		}
	}
	
	this.Draw = function (ctx){
		ctx.save ();
		ctx.globalAlpha = 1-this.elapsed/this.duration;
		ctx.fillStyle = this.color;

		for (var i = 0; i < this.nbParticles; ++i){
			var currParticle = this.particles[i];
			ctx.fillRect(currParticle.pos.x,currParticle.pos.y,this.size,this.size);
		}

		ctx.restore ();
	}
}

///////////////////////////////////////////////////////////////////////////////
// DogEffect: handles how to display the dog effect when ones die
///////////////////////////////////////////////////////////////////////////////
var DogEffect = function (duration){
	this.duration = duration;
	this.elapsed = 0;
	
	this.done = false;

	this.Update = function (dt){
		this.elapsed += dt;
		if (this.elapsed > this.duration){
			this.done = true;
		}

		dogSprite.Animate();
	}
	
	this.Draw = function (ctx){
		var ratio = this.elapsed/(this.duration*0.6);
		if (ratio > 1) ratio = 1;
		var ySize = 1.5*DOG_SIZE;

		var yPos = GAME_HEIGHT - (ySize*ratio)
		var xPos = (GAME_WIDTH/2)-(DOG_SIZE)/2;

		dogSprite.Draw(g_DataCache, gameEngine.states['game'].viewport, xPos, yPos, DOG_SIZE, ySize);
	}
}

///////////////////////////////////////////////////////////////////////////////
// Death state
///////////////////////////////////////////////////////////////////////////////

EndOfLevelState = function(){
}

EndOfLevelState.prototype.Draw = function (modifier) {
	g_Screen.drawCenterText ("End of level \\o/", GAME_WIDTH/2, GAME_HEIGHT/2-50, "grey", "24pt Calibri");
	

	g_Screen.drawCenterText (g_gameInfo.currDeath + ' deaths', GAME_WIDTH/2, GAME_HEIGHT/2, "grey", "18pt Calibri");
	g_Screen.drawCenterText ('done in ' + g_gameInfo.levelTimer.ChronoString(), GAME_WIDTH/2, GAME_HEIGHT/2+40, "grey", "18pt Calibri");
}

EndOfLevelState.prototype.KeyPress = function(event){
	if (event.keyCode == KB_ENTER) {	// Pressing "enter"
		g_gameInfo.currLevelIndex++;

		g_gameInfo.totalDeath += g_gameInfo.currDeath;

		g_gameInfo.currDeath = 0;
		gameEngine.states['game'].InitGame();
		gameEngine.ChangeState("game");
	}
}

///////////////////////////////////////////////////////////////////////////////
// Game state
///////////////////////////////////////////////////////////////////////////////
GameState = function(){
	this.viewport = new Viewport(gameEngine);
	this.InitGame();
}

var defaultSpeed = { 
		x : 0, 
		y : 0
	};

var heroStart = {
		speed : { x : 0, y : 0 },
		pos : { x : 600, y : 400 }
	};

GameState.prototype = {
	hero : heroStart,
	currLevel : [], // affected later based on currLevelIndex
	trailQueue : [],
	trailTimer : {}
}

GameState.prototype.InitGame =function(){
	// this.currLevel = levels[g_gameInfo.currLevelIndex];
	// console.log (g_gameInfo.currLevelIndex);
	this.currLevel = levels[g_gameInfo.currLevelIndex].clone();
	
	this.InitPlayer();
	this.trailTimer = new Timer ();
	this.trailTimer.Start ();
	this.trailQueue = [];
}

GameState.prototype.InitPlayer =function(){
	var midPos =  BLOC_SIZE/2-PLAYER_SIZE/2;

	for (var j = 0; j < NB_Y_BLOC; ++j) {
		for (var i = 0; i < NB_X_BLOC; ++i) {
			if (this.currLevel[j][i] == BLOCK.PLAYER_START)
			{
				this.hero.pos = {
					x : i*BLOC_SIZE+midPos,
					y : j*BLOC_SIZE+midPos
				}
			}
		}
	}
	this.hero.speed = {x:0,y:0};

	g_gameInfo.levelTimer.Start();
}

GameState.prototype.KeyPress = function(event){
	if (event.keyCode == KB_ENTER) {	// Pressing "enter"
		gameEngine.ChangeState("editor");		
	}
}

GameState.prototype.Update = function (modifier) {
	if (KB_LEFT in gameEngine.keysDown) {
		this.hero.speed.x -= SPEED_X * modifier;
		if (this.hero.speed.x < -MAX_SPEED_X)
			this.hero.speed.x = -MAX_SPEED_X;
	}
	if (KB_RIGHT in gameEngine.keysDown) {
		this.hero.speed.x += SPEED_X * modifier;
		if (this.hero.speed.x > MAX_SPEED_X)
			this.hero.speed.x = MAX_SPEED_X;
	}
	if (KB_ESCAPE in gameEngine.keysDown) {
		gameEngine.ChangeState("menu");
	}

	this.hero.speed.y += G * modifier; // gravity
	
	// Yes, this is hacky. No, I don't care.
	if (
		this.hero.pos.x+this.hero.speed.x+1.5*PLAYER_SIZE > GAME_WIDTH
	) {
		// Reached the end of the level
		if (g_gameInfo.currLevelIndex < levels.length){
			g_gameInfo.levelTimer.Stop();
			gameEngine.ChangeState ("endoflevel");
		}
	}

	this.handleCollisions(modifier);

	if (this.hero.pos.y > GAME_HEIGHT){
		this.die();
	}

	this.hero.pos.x += this.hero.speed.x;
	this.hero.pos.y += this.hero.speed.y;

	if (this.trailTimer.IsElapsed(TIME_BETWEEN_TRAIL)){
		this.trailTimer.Start ();
		this.trailQueue.push({x:this.hero.pos.x, y:this.hero.pos.y});
		if (this.trailQueue.length > MAX_TRAIL_QUEUE){
			this.trailQueue.shift ();
		}
	}
};

// Convert screen coordinates into cell coordinates
function getCell (pt){
	var res = 
	{
		x : Math.floor(pt.x / BLOC_SIZE),
		y : Math.floor(pt.y / BLOC_SIZE)
	}
	return res;
}

function hasCollision (level, cell){
	res = 0;
	if ((cell.x >= 0 && cell.x < NB_X_BLOC)
	&& (cell.y >= 0 && cell.y < NB_Y_BLOC))
	{
		res = level[cell.y][cell.x];
	}

	return res;
}

GameState.prototype.die  = function(){
	gameEngine.effects.push ( new FadeEffect ("rgb(255, 40, 40)", 0.3, false) );
	
	g_gameInfo.currDeath++;
	gameEngine.ChangeState("death");
	// dog_laugh.play();
}

GameState.prototype.handleVerticalCollisions  = function(block1, block2){
	blocs = [block1, block2];

	for (i = 0; i < blocs.length; i++)
	{
		currBlock = blocs [i];

		if (hasCollision (this.currLevel, currBlock) != BLOCK.NONE){
			// Block that can be destroyed
			if (this.currLevel[currBlock.y][currBlock.x] == BLOCK.DESTROYABLE){
				this.currLevel[currBlock.y][currBlock.x] = BLOCK.NONE;
				gameEngine.effects.push ( new BlockDisappearEffect ("grey", 1, {x:currBlock.x*BLOC_SIZE, y:currBlock.y*BLOC_SIZE}, 4) );
			}
			// Block that kills
			else if (this.currLevel[currBlock.y][currBlock.x] == BLOCK.EXPLODE){
				this.die ();
				// sound_explosion.play ();
				gameEngine.effects.push ( new ExplosionEffect ("rgb(255, 40, 40)", 1, this.hero.pos, 50) );
			}

			break;
		}
	}
}

GameState.prototype.handleCollisions = function (){
	this.hero.cell = getCell (this.hero.pos);
	var newPos = 
	{
		x : this.hero.pos.x + this.hero.speed.x,
		y : this.hero.pos.y + this.hero.speed.y
	}
	var newPosBottomRight = {
		x: newPos.x + PLAYER_SIZE,
		y: newPos.y + PLAYER_SIZE
	}
	var newCell = getCell (newPos);
	var newCellBR = getCell (newPosBottomRight);
	// Vertical collisions
	if ((hasCollision (this.currLevel, {x:newCell.x, y:newCellBR.y}) != BLOCK.NONE || hasCollision (this.currLevel, newCellBR) != BLOCK.NONE) && newCellBR.y > this.hero.cell.y)
	{
		this.handleVerticalCollisions({x:newCell.x, y:newCellBR.y}, newCellBR);
		this.hero.speed.y = -0.65;
		// sound_bounce.play();
	}
	else
	{
		// /!\ This is crap
		// todo -> make a better code, cleaner a more efficient. Same for vertical collisions

		// Horizontal collisions
		if ((hasCollision (this.currLevel, {x:newCell.x, y: newCell.y}) != BLOCK.NONE || hasCollision (this.currLevel, {x:newCell.x, y: newCellBR.y}) != BLOCK.NONE) && newCell.x < this.hero.cell.x){
			this.hero.speed.x *= -1;
		}
		if ((hasCollision (this.currLevel, {x:newCellBR.x, y: newCell.y}) != BLOCK.NONE || hasCollision (this.currLevel, {x:newCellBR.x, y: newCellBR.y}) != BLOCK.NONE) && newCellBR.x > this.hero.cell.x){
			this.hero.speed.x *= -1;
		}	
	}
}


// Draw everything
GameState.prototype.Draw = function () {
	g_Screen.drawRect (0,0, GAME_WIDTH, GAME_HEIGHT, "#303030");
	this.DrawLevel(this.currLevel);
	this.DrawPlayer();
};

imageName = {
		1 : "bloc1",
		2 : "bloc2",
		3 : "bloc3",
		4 : "bloc4"
	};

function drawBlock(x,y, blocId){
	gameEngine.states ['game'].viewport.DrawSprite (
					imageName[blocId], 
					x,
					y,
					BLOC_SIZE,
					BLOC_SIZE
				);
}


GameState.prototype.DrawLevel = function (level) {
	g_Screen.drawRect (0,0, GAME_WIDTH, GAME_HEIGHT, "#303030");
	
	for (x = 0; x < NB_X_BLOC; ++x)
		for (y = 0; y < NB_Y_BLOC; ++y)
		{
			v = level[y][x];
			if (0 != v) {
				xOffset = x*BLOC_SIZE;
				yOffset = y*BLOC_SIZE;
				drawBlock (xOffset, yOffset, v);
			}
			
		}

	// "HUD". Well, sort of
	g_Screen.drawText (
			"Hero : (" 
			+ this.hero.pos.x.toFixed (1)
			+ ', '
			+ this.hero.pos.y.toFixed (1)
			+ ')', 
			32,
			32,
			"rgb(0, 250, 250)", 
			"18px Helvetica"
		);
	g_Screen.drawText (
			this.trailTimer.ChronoString(), 
			32,
			64,
			"rgb(0, 250, 250)", 
			"12px Helvetica"
		);
};


GameState.prototype.DrawPlayer = function () {
	var playerColor = 'rgb(255,255,255)';
	if (this.trailQueue.length > 0)
	{
		for (i = 0; i < this.trailQueue.length; ++i)
		{
			currPos = this.trailQueue[i];
			var transpa = i/this.trailQueue.length;
			g_Screen.drawRect (currPos.x, currPos.y, PLAYER_SIZE, PLAYER_SIZE, playerColor, transpa);
		}
	}
	g_Screen.drawRect (this.hero.pos.x, this.hero.pos.y, PLAYER_SIZE, PLAYER_SIZE, playerColor);
};

///////////////////////////////////////////////////////////////////////////////
// Our application
// Initialization of the global variables (the different states + the engine)
// and execution of the game
///////////////////////////////////////////////////////////////////////////////
var gameEngine = new K2DEngine({
	width: GAME_WIDTH,
	height : GAME_HEIGHT,
	datacache:g_DataCache,
	stateAfterLoading : "menu"
});

var g_Screen = new Screen (gameEngine);

var menuState = new MenuState();
var gameState = new GameState();
var creditState = new CreditState();
var editorState = new EditorState();
var deathState = new DeathState();
var endOfLevelState = new EndOfLevelState();

gameEngine.states = 
	{
		menu  : menuState,
		game  : gameState,
		credit: creditState,
		editor: editorState,
		death : deathState,
		endoflevel : endOfLevelState
	};

gameEngine.Init();