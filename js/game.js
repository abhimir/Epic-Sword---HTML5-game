var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 320;
var FPS = 30;
var canvas = document.getElementById('game').getContext('2d');
var key = {up: false, right: false, down: false, left: false};
var enemies = [];
var bullets = [];
var skels = [];
var coins = [];
var swords = 0;
var score = 0;
var record = 0;
var loadBar = 0;
var dificulty = 0.98;
var gameOver = false;
// var extension = 'mp3'; // firefox does not support mp3
/*
var ua = navigator.userAgent.toLowerCase();
if(ua.indexOf('applewebkit/') == -1) {
	extension = 'ogg';
}
*/
Number.prototype.clamp = function(min, max) {
	return Math.min(Math.max(this, min), max);
}

var imgTile = new Image();
var imgPlayer = new Image();
var imgEnemy1 = new Image();
var imgSwordRight = new Image();
var imgSwordLeft = new Image();
var imgSkl = new Image();
var imgSklLeft = new Image();
var imgPlayerSkel = new Image();
var imgCoin = new Image();
/*
var sndMusic = new Audio('snd/dreams.'+extension);
var sndScream = new Audio('snd/scream.wav');
var sndSword = new Audio('snd/sword1.wav');
var sndKill = new Audio('snd/kill.wav');
var sndPower = new Audio('snd/sword2.wav');
var sndClick = new Audio('snd/click.wav');
var sndDuck = new Audio('snd/duck.wav');
*/

imgTile.addEventListener('load', function() {resourceLoaded(10)}, false);
imgPlayer.addEventListener('load', function() {resourceLoaded(20)}, false);
imgEnemy1.addEventListener('load', function() {resourceLoaded(10)}, false);
imgSwordRight.addEventListener('load', function() {resourceLoaded(10)}, false);
imgSwordLeft.addEventListener('load', function() {resourceLoaded(10)}, false);
imgSkl.addEventListener('load', function() {resourceLoaded(10)}, false);
imgSklLeft.addEventListener('load', function() {resourceLoaded(10)}, false);
imgPlayerSkel.addEventListener('load', function() {resourceLoaded(10)}, false);
imgCoin.addEventListener('load', function() {resourceLoaded(10)}, false);

imgTile.src = 'img/tile.jpg';
imgPlayer.src = 'img/player.png';
imgEnemy1.src = 'img/enemy.png';
imgSwordRight.src = 'img/sword_right.png';
imgSwordLeft.src = 'img/sword_left.png';
imgSkl.src = 'img/skel_right.png'
imgSklLeft.src = 'img/skel_left.png';
imgPlayerSkel.src = 'img/player_skel.png';
imgCoin.src = 'img/coin.png';

function update() {
	player.update();
	if(power.active && collides(player, power)) {
	//	sndPower.play();
		swords+=10;
		power.active = false;
		power.x = (Math.random() * CANVAS_WIDTH).clamp(50, CANVAS_WIDTH - 50 );
		power.y = (Math.random() * CANVAS_HEIGHT).clamp(50, CANVAS_HEIGHT - 50);
	}
	enemies.forEach(function(enemy) {
		enemy.update();
		if(collides(player, enemy)) {
			gameOver = true;
	//		sndMusic.pause();
	//		sndMusic.currentTime = 0;
	//		sndScream.play();
		}
	});
	bullets.forEach(function(bullet) {
		bullet.update();
	});
	skels.forEach(function(skel) {
		skel.update();
	});
	
	enemies.forEach(function(enemy) {
		bullets.forEach(function(bullet) {
			if(bullet.active && collides(enemy, bullet)) {
				bullet.active = false;
				enemy.active = false;
				var skel = Skel();
				skel.x = enemy.x;
				skel.y = enemy.y;
				if(enemy.x > player.x) {
					skel.image = imgSklLeft;
				}
				skels.push(skel); 
				score+=5;
			//	sndKill.play();
				if(Math.random() > 0.6) {
					var coin = Coin();
					coin.x = enemy.x;
					coin.y = enemy.y;
					coins.push(coin);
				}
			}
		});
	});
	
	coins.forEach(function(coin) {
		if(collides(coin, player)) {
			coin.active = false;
			score+=10;
		//	sndClick.pause();
		//	sndClick.play();
		}
	});
	
	enemies = enemies.filter(function(enemy) {
		return enemy.active;
	});
	bullets = bullets.filter(function(bullet) {
		return bullet.active;
	});	
	skels = skels.filter(function(skel) {
		return skel.active;
	});
	coins = coins.filter(function(coin) {
		return coin.active;
	});	
	
	if(Math.random() > dificulty) {
		enemy = Enemy();
		enemy.y = Math.random() *  CANVAS_HEIGHT;
		if(dificulty <= 0.97 && Math.random() > 0.5) {
			enemy.x = 0;
		}
		else {
			enemy.x = CANVAS_WIDTH - enemy.width;
		}
		enemies.push(enemy);
	}
	power.update();
	coins.forEach(function(coin) {
		coin.update();
	});
	if(score > record) record = score;
	if(score > 50 && dificulty >= 0.98) dificulty = 0.97;
	if(score > 100 && dificulty >= 0.97) dificulty = 0.96;	
	if(score > 150 && dificulty >= 0.96) dificulty = 0.95;
	
}

function draw() {
	fillBackground();
	skels.forEach(function(skel) {
		skel.draw();
	});

	power.draw();
	coins.forEach(function(coin) {
		coin.draw();
	});	
	enemies.forEach(function(enemy) {
		enemy.draw();
	});
	bullets.forEach(function(bullet) {
		bullet.draw();
	});
	if(gameOver) {
		canvas.drawImage(imgPlayerSkel, player.x, player.y, imgPlayerSkel.width, imgPlayerSkel.height);
		canvas.fillText("Game Over", CANVAS_WIDTH / 2 - 42, CANVAS_HEIGHT / 2 - 30);
		canvas.fillText("(press spacebar to play again)", CANVAS_WIDTH / 2 - 115, CANVAS_HEIGHT / 2);		
	}
	else {
		player.draw();		
	}
	canvas.font = 'bold 16px sans-serif';
	canvas.fillStyle = '#333';
	canvas.fillText('Score: ' + score, 20, 20);
	if(swords <= 0) canvas.fillStyle = '#D00';
	canvas.fillText('Swords: ' + swords, 120, 20);
	canvas.fillStyle = '#333';
	canvas.fillText('Record: ' + record, 240, 20);
}

var power = {
	x: CANVAS_WIDTH / 2,
	y: CANVAS_HEIGHT / 2 + (CANVAS_HEIGHT / 4),
	width: 20,
	height: 7,
	active: true,
	blink: true,
	blinkTime: 2,
	time: (Math.random() * 300),
	update: function() {
		if(this.time<=0) {
			this.active = true;
			this.time = (Math.random() * 300) + 150;
		}
		else {
			this.time--;
		}
		if(this.active && this.blinkTime <= 0) {
			this.blink = !this.blink;
			this.blinkTime = 2;
		}
		else {
			this.blinkTime--;
		}
	},
	draw: function() {
		if(this.active && this.blink) {
			canvas.drawImage(imgSwordRight, this.x, this.y, this.width, this.height);
		}
	}
}

var player = {
	x: CANVAS_WIDTH / 2,
	y: CANVAS_HEIGHT / 3,
	width: 32,
	height: 32,
	velocity: 5,
	sprite: 0,
	direction: 'right',
	spriteOffset: 0,
	spriteTime: 4,
	update: function() {
		if(key.right) {
			this.x += this.velocity;
			this.spriteOffset = 0;
		}
		if(key.left) {
			this.x -= this.velocity;
			this.spriteOffset = this.width * 2;
		}
		if(key.up) {
			this.y -= this.velocity;
		}
		if(key.down) {
			this.y += this.velocity;
		}
		
		this.x = this.x.clamp(0, CANVAS_WIDTH - this.width);
		this.y = this.y.clamp(0, CANVAS_HEIGHT - this.height);
		
		if(this.spriteTime <= 0) {
			if(key.up || key.right || key.down || key.left) this.sprite = 1 - this.sprite;
			this.spriteTime = 5;
		}
		else {
			this.spriteTime--;
		}
	},
	draw: function() {
		canvas.drawImage(imgPlayer, (this.width * this.sprite) + this.spriteOffset, 0, 
			this.width, this.height, this.x, this.y, this.width, this.height);	
	}
}

function Enemy() {
	var I = {};
	I.x = 10;
	I.y = 10;
	I.width = 32;
	I.height = 32;
	I.velocity = 2;
	I.sprite = 0;
	I.active = true;
	I.spriteOffset = 0;
	I.spriteTime = 5;
	I.image = imgEnemy1;
	I.update = function() {
		if((player.x > this.x)) { 
			this.x += this.velocity;
			this.spriteOffset = 0;
		}
		else if(player.x + player.width / 4 < this.x) { 
			this.x -= this.velocity;
			this.spriteOffset = this.width * 2;
		}
		if(player.y > this.y) this.y += this.velocity - 1;
		else if(player.y + player.height / 4 < this.y) this.y -= this.velocity - 1; 
		
		this.x = this.x.clamp(0, CANVAS_WIDTH - this.width);
		this.y = this.y.clamp(0, CANVAS_HEIGHT - this.height);
		
		if(this.spriteTime <= 0) {
			this.sprite = 1 - this.sprite;
			this.spriteTime = 5;
		}
		else {
			this.spriteTime--;
		}	
	};
	I.draw = function() {
		canvas.drawImage(this.image, (this.width * this.sprite) + this.spriteOffset, 0, 
			this.width, this.height, this.x, this.y, this.width, this.height);
	};
	return I;
}

function Skel() {
	var S = {}
	S.x = 0;
	S.y = 0;
	S.image = imgSkl;
	S.width = S.image.width;
	S.height = S.image.height;
	S.lifeTime = 50;
	S.active = true;
	S.update = function() {
		if(this.lifeTime <= 0) {
			this.active = false;
			this.lifeTime = 15;
		}
		else {
			this.lifeTime--;
		}
	};
	S.draw = function() {
		canvas.drawImage(this.image, this.x, this.y, this.width, this.height);
	}
	return S;
}

function Coin() {
	var C = {};
	
	C.x = 0;
	C.y = 0;
	C.active = true;
	C.width = 15;
	C.height = 15;
	C.sprite = 0;
	C.spriteTime = 3;
	C.lifeTime = 150;
	C.update = function() {
		if(this.lifeTime <= 0) {
			this.active = false;
		}
		else {
			this.lifeTime--;
		}
		if(this.spriteTime <= 0) {
			this.sprite++;
			if(this.sprite > 3) this.sprite = 0;
			this.spriteTime = 3;
		}
		else {
			this.spriteTime--;
		}
	};
	C.draw = function() {
		canvas.drawImage(imgCoin, (this.sprite * this.width), 0, this.width, this.height, this.x, 
			this.y, this.width, this.height);
	};
	return C;
}
function Bullet() {
	var B = {};
	B.image = imgSwordRight;
	B.x = 0;
	B.y = 0;
	B.width = B.image.width;
	B.height = B.image.height;
	B.velocity = 10;
	B.active = true;
	B.direction = {
		right: false,
		left: false
	};
	
	B.update = function() {
		if(this.direction.right) {
			this.x += this.velocity;
		}
		else this.x -= this.velocity;
		
		if(this.x > CANVAS_WIDTH) this.active = false;
		if(this.x + this.width < 0) this.active = false;
	};
	B.draw = function() {
		canvas.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
	};
	return B;
}

function fillBackground() {
	var x = 0;
	var y = 0;
	while(y <= CANVAS_HEIGHT - imgTile.height) {
		while(x <= CANVAS_WIDTH - imgTile.width) {
			canvas.drawImage(imgTile, x, y, imgTile.width, imgTile.height);
			x+=imgTile.width;
		}
		x=0;
		y+=imgTile.height;
	}
}


document.onkeydown = function(e) {
	if(e.keyCode == 39) {
		key.right = true;
		key.left = false;
		player.direction = 'right';
	}
	if(e.keyCode == 37) {
		key.right = false;
		key.left = true;
		player.direction = 'left';		
	}
	if(e.keyCode == 38) {
		key.up = true;
		key.down = false;
	}
	if(e.keyCode == 40) {
		key.up = false;
		key.down = true;
	}
	if(e.keyCode == 32) {
		if(gameOver) {
			enemies = [];
			bullets = [];
			skels = [];
			coins = [];
			swords = 20;
			score = 0;
			dificulty = 0.98;
			player.x = CANVAS_WIDTH / 2;
			player.y = CANVAS_HEIGHT / 3;		
			power.active = true;
	//		sndMusic.play();
			gameOver = false;
		}
	}
	if(e.keyCode == 90 && !gameOver) { // key z
		if(swords > 0) {
			var bullet = Bullet();
			if(player.direction == 'right') {
				bullet.direction.right = true;
				bullet.image = imgSwordRight;
				bullet.x = player.x + player.width / 3;
			}
			else {
				bullet.direction.left = true;
				bullet.image = imgSwordLeft;	
				bullet.x = player.x;
			}
			bullet.y = player.y + player.height / 3;
			bullets.push(bullet);
//			sndSword.play();
			swords--;
		}
		else {
//			sndDuck.play();
		}
	}
}

document.onkeyup = function(e) {
	if(e.keyCode == 39) key.right = false;
	if(e.keyCode == 37) key.left = false;
	if(e.keyCode == 38) key.up = false;
	if(e.keyCode == 40) key.down = false;
}

function collides(a, b) {
	return 	a.x < b.x + b.width &&
			a.x + a.width > b.x &&
			a.y < b.y + b.height &&
			a.y + a.height > b.y;
}

function startGame() {
//	sndMusic.loop = true;
//	sndMusic.play();
	swords = 20;
	score = 0;
	dificulty = 0.98;
	player.x = CANVAS_WIDTH / 2;
	player.y = CANVAS_HEIGHT / 3;
	setInterval(function() {
		if(!gameOver) {
			update();
			draw();
		}
	}, 1000/FPS);
}

// loadbar
function resourceLoaded(n) {
	loadBar += n;
	var x = loadBar * CANVAS_WIDTH / 100;
	canvas.fillStyle = "#000";
	canvas.fillRect(0, 10, x, 10);
	if(loadBar>=100) startGame();
}
/*
sndMusic.addEventListener('canplay', resourceLoaded(15), false);
sndScream.addEventListener('canplay', resourceLoaded(5), false);
sndSword.addEventListener('canplay', resourceLoaded(5), false);
sndKill.addEventListener('canplay', resourceLoaded(5), false);
sndPower.addEventListener('canplay', resourceLoaded(5), false);
sndClick.addEventListener('canplay', resourceLoaded(5), false);
sndDuck.addEventListener('canplay', resourceLoaded(5), false);
*/
