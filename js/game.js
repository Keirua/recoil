// Heavily based on http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
var GAME_WIDTH = 640;
var GAME_HEIGHT = 480;

var NB_X_BLOC = 20;
var NB_Y_BLOC = 15;

var BLOC_SIZE = 32;
var PLAYER_SIZE = 8;

//Create a sound 
// /!\ Does not work in firefox
// var bullet_sound = new Audio("sound/bullet.mp3");

g_DataCache = new DataCache();

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
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

g_DataCache.queue = [
	"bloc1",
	"bloc2",
	"bloc3",
	"bloc4"
];

// Handles the mouse events
document.onmousemove = function (event){
	// console.log("mouse", event);
}

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

MenuState.prototype.HandleEvent = function(event){
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
		bullet_sound.play();
		this.activeItem = (this.activeItem-1);
		if (this.activeItem < 0)
			this.activeItem = this.menuItems.length-1;
	}
	if (event.keyCode == KB_DOWN) { // Player holding down
		bullet_sound.play();
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
// Game state
///////////////////////////////////////////////////////////////////////////////
GameState = function(){
	this.viewport = new Viewport(gameEngine);
}

var heroStart = {
		speed: 128, // movement in pixels per second
		pos:{ x: 600, y: 400 }
	};

GameState.prototype = {
	hero : heroStart
}

GameState.prototype.Update = function (modifier) {
	var animate = false;
	
	if (KB_UP in gameEngine.keysDown) {
		this.hero.pos.y -= this.hero.speed * modifier;
	}
	if (KB_DOWN in gameEngine.keysDown) {
		this.hero.pos.y += this.hero.speed * modifier;
	}
	if (KB_LEFT in gameEngine.keysDown) {
		this.hero.pos.x -= this.hero.speed * modifier;
	}
	if (KB_RIGHT in gameEngine.keysDown) {
		this.hero.pos.x += this.hero.speed * modifier;
	}
	if (KB_ESCAPE in gameEngine.keysDown) {
		gameEngine.ChangeState("menu");
	}
	
	// Are they touching?
	// if (
	// 	this.hero.x <= (this.monster.x + 32)
	// 	&& this.monster.x <= (this.hero.x + 32)
	// 	&& this.hero.y <= (this.monster.y + 32)
	// 	&& this.monster.y <= (this.hero.y + 32)
	// ) {
	// 	this.Reset();
	// 	++this.monstersCaught;
	// 	bullet_sound.play();
	// 	gameEngine.effects.push ( new FadeEffect ("rgb(255, 255, 255)", 0.3, false) );
	// }
	if (
		this.hero.pos.x > GAME_WIDTH
	) {
		// this.hero.pos.x = heroStart.pos.x;

		console.log(this.hero);
		this.hero.pos.x = 600;
		console.log(heroStart);
		// this.Reset ();
		// this.hero.pos.x = 100;
		// bullet_sound.play();
		gameEngine.effects.push ( new FadeEffect ("rgb(255, 255, 255)", 0.3, false) );
	}
};

// Draw everything
GameState.prototype.Draw = function () {
	g_Screen.drawRect (0,0, GAME_WIDTH, GAME_HEIGHT, "#303030");

	this.DrawLevel(level);
	this.DrawPlayer();
	// Score
	// g_Screen.drawText ("Goblins caught: " + this.monstersCaught, 32, 32, "rgb(0, 250, 250)", "24px Helvetica");
};

GameState.prototype.DrawLevel = function (level) {
	g_Screen.drawRect (0,0, GAME_WIDTH, GAME_HEIGHT, "#303030");

	for (x = 0; x < NB_X_BLOC; ++x)
		for (y = 0; y < NB_Y_BLOC; ++y)
		{
			v = level[y][x];
			if (v != 0) {
				xOffset = x*BLOC_SIZE;
				yOffset = y*BLOC_SIZE;
				this.viewport.DrawSprite (
								"bloc"+v, 
								xOffset,
								yOffset,
								BLOC_SIZE,
								BLOC_SIZE
							);
			}
			
		}

	// Score
	g_Screen.drawText ("Hero x : " + this.hero.pos.x.toFixed (1), 32, 32, "rgb(0, 250, 250)", "24px Helvetica");
};


GameState.prototype.DrawPlayer = function () {
	g_Screen.drawRect (this.hero.pos.x, this.hero.pos.y, PLAYER_SIZE, PLAYER_SIZE, "white");
};

// Reset the game when the player catches a monster
GameState.prototype.Reset = function () {
	this.hero = heroStart;
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

gameEngine.states = {
		menu:menuState,
		game:gameState,
		credit:creditState
	};

gameEngine.Init();