var ctx = document.getElementById('my_canvas').getContext('2d');
var cup = new Image();
cup.src = 'images/cup.jpg';
var sounds = {blast:new Audio('audio/audioBlast.m4a'),
			bullet:new Audio('audio/audioBullet.m4a'),
			wall: new Audio('audio/brick.m4a'),
			starting:new Audio('audio/audioStart.m4a'),
			ending:new Audio('audio/audioEnd.m4a'),
			change:new Audio('audio/audioChange.m4a'),
			levelChange:new Audio('audio/levelStart.m4a'),
			enemy:new Audio('audio/audioEnemy.m4a')};
var counter=0;
var p_alpha=0;
var animateInterval;
const FPS = 50;
const BOX_SIDE = 25;
const PLAY_WIDTH = 375;
const PLAY_HEIGHT = 575;
const WIDTH = ctx.canvas.width;
const HEIGHT = ctx.canvas.height;
const ENEMY_MOVEMENT = 17//the larger the number the lesser possibility of enemy changing direction
var directions = ['left','right','up','down'];
var highScore = 0;
var blastStart=0;
var player;
var score = 0;
var level=1;
var speed = 1;
var lives = 0;
var pause = false;
var pauseCounter = 0;
var action;
var goal = [completed=0,total=0];
var button = {
	left:[{'pressed':false},{'pressedTime':0},{'releaseTime':0}],
	right:[{'pressed':false},{'pressedTime':0},{'releaseTime':0}],
	up:[{'pressed':false},{'pressedTime':0}],
	down:[{'pressed':false},{'pressedTime':0}],
	space:[{'pressed':false}],
	enter:[{'enter':false}],
	esc:[{'esc':false}]
};
var enemyList = [];
var brickList = create2DArray(23);
const BOARD_X = PLAY_WIDTH+2*BOX_SIDE;
const BOARD_Y = 10*BOX_SIDE;
var curtainCounter=-23;
var board = create2DArray(5);

brickToLevel=function(p_level,p_row,p_col){
	switch(p_level){
		case 1:
			return false;
		break;
		//////////
		//level 1 end here

		case 2:
			if(((p_row==4||p_row==15)&&((p_col>=3 && p_col <=6)||(p_col>=8&&p_col<=11)))||(p_col==3||p_col==11)&&((p_row>=5&&p_row<=7)||(p_row>=12&&p_row<=15)))
				return true;
			return false;

		break;
		///level 2 end here

		case 3:
			//if(((p_col==4||p_col==10)&&(p_row>=4&&p_row<=17))||(p_row==15&&(p_col>=5&&p_col<=9)))
			if((p_row==3||p_row==5||p_row==13||p_row==15)&&(p_col>=3&&p_col<=11))
				return true;
			if((p_row==4||p_row==14)&&(p_col%2==0&&p_col>3&&p_col<12))
				return true;
			return false;
		break;
		///level 3 end here

		case 4:
			if(((p_row>=3&&p_row<=6)||(p_row>=14&&p_row<=17))&&((p_col>=2&&p_col<=5)||(p_col>=9&&p_col<=12)))
				return true;
			if(brickToLevel(3,p_row,p_col))
				return true;
			return false;
		break;
		///level 4 end here

		case 5:
			if(((p_row==3||p_row==5||p_row==18||p_row==16)&&(p_col>=3&&p_col<=11))||((p_row==4||p_row==17)&&(p_col==7)))
				return true;
			if((p_row<=2||p_row>=19)&&(p_col==6||p_col==8))
				return true;
			if(brickToLevel(3,p_row,p_col))
				return true;
			return false;
		break;


		case 6:
			if((p_row==5&&(p_col==4||p_col==5||p_col==9||p_col==10)))
				return true;
			if((p_row==4&&(p_col>=5&&p_col<=9&&p_col!=7)))
				return true;
			if((p_row==3)&&(p_col>=6&&p_col<=8))
				return true;
			if(p_row==2&&p_col==7)
				return true;
			if((p_col==4||p_col==3||p_col==11||p_col==10)&&(p_row>=6&&p_row<=14))
				return true;
			if((p_row==10||p_row==16||p_row==21)&&(p_col>=4&&p_col<=10))
				return true;
			if((p_col==7||p_col==6||p_col==8)&&(p_row>=17&&p_row<=20))
				return true;
			return false;
		break;

		case 7:
			if(p_col==2||p_col==12)
				return false;
			if(brickToLevel(4,p_row,p_col)||brickToLevel(3,p_row,p_col)||brickToLevel(2,p_row,p_col))
				return true;
			return false;
		break;

		case 8:
			if((p_row==11||p_row==12)&&(p_col==7||p_col==8))
				return true;
			if((p_row>=13&&p_row<=16)&&(p_col>=5&&p_col<=10))
				return true;
			if(((p_col==4||p_col==5||p_col==8||p_col==9)&&(p_row<=3))||((p_col==6||p_col==7)&&(p_row>=2&&p_row<=5)))
				return true;
			if((p_row==18||p_row==19)&&(p_col==3||p_col==4))
				return true;
			if((p_row==5||p_row==6)&&(p_col==9||p_col==10))
				return true;
			return false;
		break;


		case 9:
			if((p_row==4||p_row==18||p_col==4||p_col==10))
				return true;
			if((p_col==6&&(p_row>=12&&p_row<=16))||((p_col==7||p_col==8)&&(p_row==12||p_row==14))||(p_col==8&&p_row==13))
				return true;
			return false;
		break;


		case 10:
			if((p_col==3||p_col==11||p_col==4||p_col==10)&&(p_row>=3&&p_row<=19))
				return true;
			if((p_row==3||p_row==19||p_row==4||p_row==18)&&(p_col==5||p_col==9))
				return true;
			return false;
		break;

	}
}
function create2DArray(rows){
	var a = [];
	for (var i=0;i<rows;i++) {
		a[i] = [];
	}
	return a;
}
mostRecentButtonPressed = function(){

	var mostRecentlyButtonPressed = 'none';
	var maxButtonCounter = 0;
	for(var b in button){
		if(button[b].pressed== true){
			if(maxButtonCounter < button[b].pressedTime){
				maxButtonCounter = button[b].pressedTime;
				mostRecentlyButtonPressed = b;	
			}

		}
	}
	return mostRecentlyButtonPressed;
}
createPlayer = function(p_level){
	var p_bulletSpeed=46;
	var p_speed=44;
	var p_gap=20;
	if(p_level==5||p_level==4){
		p_speed=45;
	}
	else if(p_level == 6||p_level==7){
		p_speed=46;
		p_bulletSpeed=47;
		p_gap=19;
	}
	else if(p_level==8){
		p_speed=47;
		p_bulletSpeed=48;
		p_gap=15;
	}
	else if(p_level==9||p_level==10){
		p_speed=48;
		p_bulletSpeed=49;
		if(p_level==10)
			p_speed=49; p_gap=13;
	}


	player = new bot(BOX_SIDE*6,BOX_SIDE*7,'up','player',p_speed,p_bulletSpeed,p_gap);
}
blastPlayer = function(x,y){
	if(blastStart==0){
		blastStart=counter;
		sounds.blast.currentTime=0;
		sounds.blast.play();
	}
	if(counter - blastStart > 100){

	blastStart=0;
		return true;
	}
	if(x + 3*BOX_SIDE >= PLAY_WIDTH)
		x = x - BOX_SIDE;
	if(y + 3*BOX_SIDE >= PLAY_HEIGHT)
		y -= BOX_SIDE;
	//first clear the 4*4 box in bricklist
	
	if((counter+10)%20==0){
		//ie draw fist type blast
		for(var row =0;row<=3;row++){
			for(var col=0;col<=3;col++){
				if(row==col|| row+col==3){
				//that is both the diagonals
				//add these to bricks list
					//drawBox(x+col*BOX_SIDE, y+row*BOX_SIDE);
					brickList[y/BOX_SIDE+row][x/BOX_SIDE+col]=1;
				}
				else{
					delete(brickList[y/BOX_SIDE+row][x/BOX_SIDE+col]);

				}
			}
		}
	}
	else if(counter%20==0){
		//draw 2nd image of blast
		for(var row =0;row<=3;row++){
			for(var col=0;col<=3;col++){
				if(row!=col&&row+col!=3){
				//that is both the diagonals
				//add these to bricks list
					//drawBox(x+col*BOX_SIDE, y+row*BOX_SIDE);
					brickList[y/BOX_SIDE+row][x/BOX_SIDE+col]=1;
				}
				else{
					delete(brickList[y/BOX_SIDE+row][x/BOX_SIDE+col]);

				}
			}
		}
	}
	return false;
}
dropCurtain = function(p_action){
	//return false if still drawing
	//return ture if finished drawing
	//start from down to top then again from top to bottom
	//start curtainCounter from -23 so that it will give 22 first
	//time ie last row
	//fill that row with bricks if there are not already bricks in that level on going down
	//we take zero two times one when going up and then going 
	if(curtainCounter==-23){
		sounds.levelChange.currentTime=0;
		sounds.levelChange.play();
	}
	if(action=='nextLevel')
		p_nextLevel =level+1;
	else
		p_nextLevel=level;
	drawEverything();
	counter++;
	if(counter%4==0)
		curtainCounter++;
	else
		return false;
	if(curtainCounter <=0){
		//start filling from bottom
		var p_row = Math.abs(curtainCounter);
		for(var col = 0;col < PLAY_WIDTH/BOX_SIDE;col++){
			brickList[p_row][col]=1;
		}
		return false;
	}
	else{
		if(curtainCounter==1){
			enemyList={};
			delete(player);
			createPlayer(speed);	
		}
		if(curtainCounter > 23){
			curtainCounter = -23;
			if(action=='continue'){
				startGame(0,0,0);
			}
			else if(action=='new'){
				startGame('new',0,0);
			}
			else if(action=='nextLevel'){
				startGame('nextLevel',0,0);
			}
			return true;
		}
		else
		for(var col = 0;col < PLAY_WIDTH/BOX_SIDE;col++){
			if(brickToLevel(p_nextLevel,curtainCounter-1,col)){
				brickList[curtainCounter-1][col]=1;
			}
			else
				delete(brickList[curtainCounter-1][col]);
		}
		return false;
	}
	
}
getBackgroundImage = function(){
	ctx.save();
	ctx.fillStyle = 'rgba(220,220,220,1)';
	ctx.fillRect(0,0,WIDTH,HEIGHT);
	ctx.beginPath();
	ctx.strokeStyle = 'black';
	ctx.moveTo(PLAY_WIDTH, 0);
	ctx.lineTo(PLAY_WIDTH, PLAY_HEIGHT);
	ctx.stroke();
	ctx.closePath();
	for(var x = BOARD_X; x <= PLAY_WIDTH+5*BOX_SIDE;x+=BOX_SIDE){
		for(var y = BOARD_Y;y<=13*BOX_SIDE;y+=BOX_SIDE){
			ctx.fillStyle = 'rgba(0,0,0,0.03)';
			ctx.fillRect(x+2,y+2,BOX_SIDE-4,BOX_SIDE-4);
			ctx.fillStyle = 'rgba(0,0,0,0.1)';
			ctx.fillRect(x+BOX_SIDE/3.5, y+BOX_SIDE/3.5, BOX_SIDE/7*3, BOX_SIDE/7*3);
			ctx.strokeStyle = 'rgba(0,0,0,0.1)';
			ctx.beginPath();
			ctx.rect(x+2,y+2,BOX_SIDE-4,BOX_SIDE-4);
			ctx.closePath();
			ctx.stroke();
		}
	}
		for(var x = 0;x<PLAY_WIDTH;x+=BOX_SIDE){
			for(var y = 0;y<PLAY_HEIGHT;y+=BOX_SIDE){
				ctx.fillStyle = 'rgba(0,0,0,0.03)';
				ctx.fillRect(x+2,y+2,BOX_SIDE-4,BOX_SIDE-4);
				ctx.fillStyle = 'rgba(0,0,0,0.1)';
				ctx.fillRect(x+BOX_SIDE/3.5, y+BOX_SIDE/3.5, BOX_SIDE/7*3, BOX_SIDE/7*3);
				ctx.strokeStyle = 'rgba(0,0,0,0.1)';
				ctx.beginPath();
				ctx.rect(x+2,y+2,BOX_SIDE-4,BOX_SIDE-4);
				ctx.closePath();
				ctx.stroke();
			}
		}
		ctx.restore();
}
getBackgroundImage();
var bg = ctx.getImageData(0,0,WIDTH,HEIGHT);
function drawBoard(){
	for(var row in board){
		for(var col in board[row]){
			drawBox(BOARD_X + col*BOX_SIDE, BOARD_Y + row*BOX_SIDE);
		}
	}
}

createEnemy = function(p_level){
	//there are 6 possible positions to spwan an enemy
	//generate random number and check if position is empty;
	//one way of doing this is generate enemy at that position and then check if
	//it is possible to rotate enemy is so that means position is empty
	///enemy speed min = 15 max = 47
	//bullet speed 42 to 48
	//gap max 450 to min 70
	var enemyCreated  = true;
	if(p_level > 10)
		p_level = 10;
	var p_speed = 10 + p_level * 4;
	if(p_speed > 47)
		p_speed = 47;
	var p_bulletSpeed = 42;
	if(p_level < 2){
		p_bulletSpeed = 42;
		p_bulletGap = 400;
	}
	else if(p_level < 3){
		p_bulletSpeed = 43;
		p_bulletGap = 350;
	}
	else if(p_level < 5){
		p_bulletSpeed = 44;
		p_bulletGap = 250;
	}
	else if(p_level < 7){
		p_bulletSpeed = 45;
		p_bulletGap = 190;
	}
	else if(p_level < 8){
		p_bulletSpeed = 46;
		p_bulletGap = 150;
	}
	else if(p_level < 10){
		p_bulletSpeed = 47;
		p_bulletGap = 90;
	}
	else{
		p_bulletSpeed = 48;
		p_bulletGap = 50;
	}
	var pos = Math.abs(Math.floor(Math.random()*6-0.000001));
	var p_dir = Math.abs(Math.floor(Math.random()*4-0.000001));
	switch(p_dir){
		case 0:
			p_dir = 'left';
			break;
		case 1:
			p_dir = 'right';
			break;
		case 2:
			p_dir = 'down';
			break;
		case 3:
			p_dir = 'up';
			break;
	}
	var x,y;
	var tried = 6;
	while(tried--){
		//ie if the random position is not empty then try next one,next one and so on
		//for all position
		pos = (pos+1)%6;
		switch(pos){
			case 0:
				x= 0;
				y=0;
				break;
			case 1:
				x=(PLAY_WIDTH/BOX_SIDE - 3)*BOX_SIDE;
				y=0;
				break;
			case 2:
				x=0;
				y = (Math.floor((PLAY_HEIGHT/BOX_SIDE)/2) - 1)*BOX_SIDE;
				break;
			case 3:
				x=(PLAY_WIDTH/BOX_SIDE - 3)*BOX_SIDE;
				y = (Math.floor((PLAY_HEIGHT/BOX_SIDE)/2) - 1)*BOX_SIDE;
				break;
			case 4:
				x=0;
				y=(PLAY_HEIGHT/BOX_SIDE - 3)*BOX_SIDE;
				break;
			case 5:
				x=(PLAY_WIDTH/BOX_SIDE - 3)*BOX_SIDE;
				y=(PLAY_HEIGHT/BOX_SIDE - 3)*BOX_SIDE;
				break;

		}
		//lets just generate enemy at the above position

		//enemyList[Math.random()]=new bot(BOX_SIDE*0,BOX_SIDE*0,'down','enemy',47,47,0);
		//and then check if position is free or not
		//also generate any random direction
		enemyCreated = true;
		var e = new bot(x,y,p_dir,'enemy',p_speed,p_bulletSpeed,p_bulletGap);
		for(var x_px = x; x_px <= x + 2*BOX_SIDE;x_px += BOX_SIDE){
			if(!enemyCreated)
				break;
			for(var y_px = y; y_px <= y + 2*BOX_SIDE; y_px += BOX_SIDE){
				if(checkBigPixal(x_px,y_px)!='none'){
					enemyCreated = false;
					break;
				}
			}
		}
		if(enemyCreated){
			break;
		}
		else
			delete(e);
	}
	if(enemyCreated){
		faceDirection(e,p_dir);
		enemyList[Math.random()]=e;
	}
}
function checkBigPixal(x,y){
	//first we'll check for enemy boxes and within that also for bullets
	for(var e in enemyList){
		if(Math.abs(enemyList[e].x - x) > 3*BOX_SIDE || Math.abs(enemyList[e].y - y) > 3*BOX_SIDE)//enemy is too far
			continue;
		for(var b in enemyList[e].box){
			if(enemyList[e].box[b].x == x && enemyList[e].box[b].y == y){
				return 'enemy';
			}
		}

		//for bullets
		for(var b in enemyList[e].bulletList){
			if(enemyList[e].bulletList[b].bulet.x== x && enemyList[e].bulletList[b].bulet.y== y){
				return 'enemyBullet';
			}
		}
	}
	//now check for player
	if(player)
	for(var b in player.box){
		if(player.box[b].x == x && player.box[b].y == y){
			return 'player';
		}
	}
	//check for playerBullet
	if(player)
	for(var b in player.bulletList){
		if(player.bulletList[b].bulet.x == x && player.bulletList[b].bulet.y == y){
			return 'playerBullet';
		}
	}
	//check for walls
	for(var row in brickList){
		for(col in brickList[row]){
			if(col*BOX_SIDE == x && row*BOX_SIDE == y){
				return 'wall';
			}
		}
	}
	return 'none';

}
drawBackground = function(){
	if(score > highScore){
		highScore = score;
	}
	ctx.putImageData(bg,0,0);
	ctx.save();
	var p_center = Math.floor(WIDTH/2 +PLAY_WIDTH/2);
	ctx.font = "30px clock-font";
	ctx.textAlign ='center';
	ctx.fillText('Score',p_center,BOX_SIDE*2);
	ctx.fillText(score,p_center,BOX_SIDE*3+BOX_SIDE/3)
	ctx.fillText('High score',p_center,BOX_SIDE*5);
	ctx.fillText(highScore,p_center,BOX_SIDE*6+BOX_SIDE/3);
	if(goal.total > 0){
		ctx.fillText('G O A L',p_center,BOX_SIDE*8);
		ctx.fillText(goal.completed+' / '+goal.total,p_center, BOX_SIDE*9+BOX_SIDE/3);
	}
	if(lives > 0){
		for(var p_lives = 0;p_lives<lives ;p_lives++){
			drawBox(BOARD_X, BOARD_Y + (3-p_lives)*BOX_SIDE);
		}
	}
	ctx.textAlign = 'left';
	ctx.fillText('level    '+level,PLAY_WIDTH+2*BOX_SIDE, BOX_SIDE*16);
	ctx.fillText('speed   '+speed,PLAY_WIDTH+2*BOX_SIDE, BOX_SIDE*17+BOX_SIDE/2);

	ctx.globalAlpha=0.14;
	ctx.drawImage(cup,PLAY_WIDTH+BOX_SIDE*3.1, HEIGHT-4.5*BOX_SIDE, BOX_SIDE*2, BOX_SIDE*2);
	ctx.fillStyle ='black';
	ctx.textAlign='center';
	ctx.fillText('pause',p_center,BOX_SIDE*22);


	ctx.restore();

}
displayPause = function(){
	var p_center = Math.floor(WIDTH/2 +PLAY_WIDTH/2);
	p_alpha = Math.round(p_alpha*100)/100;
	if(pauseCounter%3==0){
		p_alpha+=0.1;
		if(p_alpha<=1)
			pause_alpha=p_alpha;
		else{
			if(p_alpha>=2){
				p_alpha=0;
				pause_alpha=0;
			}
			else
			pause_alpha = 2-p_alpha;
		}
	}
	ctx.save();
	ctx.clearRect(PLAY_WIDTH+BOX_SIDE*2, HEIGHT-4.5*BOX_SIDE, BOX_SIDE*4, BOX_SIDE*4);
	ctx.fillStyle = 'rgba(220,220,220,1)';
	ctx.fillRect(PLAY_WIDTH+BOX_SIDE*2, HEIGHT-4.5*BOX_SIDE, BOX_SIDE*4, BOX_SIDE*4+1)
	ctx.font = "30px clock-font";
	ctx.globalAlpha=pause_alpha;
	ctx.drawImage(cup,PLAY_WIDTH+BOX_SIDE*3.1, HEIGHT-4.5*BOX_SIDE, BOX_SIDE*2, BOX_SIDE*2);
	ctx.fillStyle ='black';
	ctx.textAlign='center';
	ctx.fillText('pause',p_center,BOX_SIDE*22);
	ctx.restore();
}
checkHeadLockStatus = function(bx,by,x,y){
	if((bx==x+BOX_SIDE &&(by==y||by==y+2*BOX_SIDE))||((bx==x||bx==x+2*BOX_SIDE)&&by==y+BOX_SIDE))
		return 2;
	if((bx == x && (by== y || by == y + 2*BOX_SIDE))||(bx==x + 2*BOX_SIDE &&(by == y || by == y + 2*BOX_SIDE)))
		return 1;
	return 0;
}
faceDirection = function(bot,direction){
	//first check if head is locked
	var headLocked = false;
	var headBlockedByBoxes = 0;
	var blockBox = {};
	var head = bot.head();
	var u=true,d=true,l=true,r=true;
	//check if there are any boxes in 3*3 area of the bot
	//first check with all the enemies
	for(var e in enemyList){
		if(Math.abs(enemyList[e].x - bot.x) > 4*BOX_SIDE || Math.abs(enemyList[e].y - bot.y) > 4*BOX_SIDE || enemyList[e]===bot)//enemy is too far
			continue;
		for(var b in enemyList[e].box){
			//first check if it can move up down,right left/ needs below if head is locked
			if(enemyList[e].box[b].x == bot.x + BOX_SIDE && enemyList[e].box[b].y == bot.y - BOX_SIDE)
				u = false;
			else if(enemyList[e].box[b].x == bot.x + BOX_SIDE && enemyList[e].box[b].y == bot.y + 3*BOX_SIDE)
				d = false;
			else if(enemyList[e].box[b].x == bot.x - BOX_SIDE && enemyList[e].box[b].y == bot.y + BOX_SIDE)
				l = false;
			else if(enemyList[e].box[b].x == bot.x + 3*BOX_SIDE && enemyList[e].box[b].y == bot.y + BOX_SIDE)
				r = false;
			switch(checkHeadLockStatus(enemyList[e].box[b].x, enemyList[e].box[b].y, bot.x, bot.y)){
				case 1:
					headLocked = true;
					blockBox.x = enemyList[e].box[b].x;
					blockBox.y = enemyList[e].box[b].y;
					headBlockedByBoxes++;
					break;
				case 2:
					return false;
					break;
			}

			
		}
	}
	//check with bricks/walls
	for(var row in brickList){
		for(var col in brickList[row]){

			if(col*BOX_SIDE == bot.x + BOX_SIDE && row*BOX_SIDE == bot.y - BOX_SIDE)
				u = false;
			else if(col*BOX_SIDE == bot.x + BOX_SIDE && row*BOX_SIDE == bot.y + 3*BOX_SIDE)
				d = false;
			else if(col*BOX_SIDE == bot.x - BOX_SIDE && row*BOX_SIDE == bot.y + BOX_SIDE)
				l = false;
			else if(col*BOX_SIDE == bot.x + 3*BOX_SIDE && row*BOX_SIDE == bot.y + BOX_SIDE)
				r = false;

			switch(checkHeadLockStatus(col*BOX_SIDE, row*BOX_SIDE, bot.x, bot.y)){
				case 1:
					headLocked = true;
					blockBox.x = col*BOX_SIDE;
					blockBox.y = row*BOX_SIDE;
					headBlockedByBoxes++;
					break;
				case 2:
					return false;
					break;
			}
		}
	}
	//if bot is player and head is not locked then it is free to rotate
	if(headLocked == false && bot.type == 'player'){
		bot.faceSide(direction);
		return true;
	}
	//if bot is enemy then collision with player is left
	if(bot.type == 'enemy'){
		if(player)
		for(var b in player.box){
			if(player.box[b].x == bot.x + BOX_SIDE && player.box[b].y == bot.y - BOX_SIDE)
				u = false;
			else if(player.box[b].x == bot.x + BOX_SIDE && player.box[b].y == bot.y + 3*BOX_SIDE)
				d = false;
			else if(player.box[b].x == bot.x - BOX_SIDE && player.box[b].y == bot.y + BOX_SIDE)
				l = false;
			else if(player.box[b].x == bot.x + 3*BOX_SIDE && player.box[b].y == bot.y + BOX_SIDE)
				r = false;
			//check if may be the enemy head is locked with
			switch(checkHeadLockStatus(player.box[b].x, player.box[b].y, bot.x, bot.y)){
				case 1:
					headLocked = true;
					blockBox.x = player.box[b].x;
					blockBox.y = player.box[b].y;
					headBlockedByBoxes++;//if headblockedBy boxes is 1 then it can rotate in certain direction
					break;
				case 2:
					return false;
					break;
			}
		}
	}
	if(headLocked == false){
		bot.faceSide(direction);
		return true;
	}
	if(headBlockedByBoxes == 1){
		if(direction == 'up'){
			if(blockBox.y== bot.y){
				bot.faceSide('up');
				return true;
			}
		}
		else if(direction == 'down'){
			if(blockBox.y == bot.y + 2*BOX_SIDE){
				bot.faceSide('down');
				return true;
			}
		}
		else if(direction == 'left'){
			if(blockBox.x ==  bot.x){
				bot.faceSide('left');
				return true;
			}
		}
		else if(direction == 'right'){
			if(blockBox.x == bot.x + 2*BOX_SIDE){
				bot.faceSide('right');
				return true;
			}
		}
	}
	switch(direction){
		case 'up':
			if(bot.dir != 'down' || !u)
				return false;
			//move up
			if(bot.y <= 0)
				return false;
			bot.faceSide('up' );
			for(var b in bot.box){
				bot.box[b].y -= BOX_SIDE;
			}
			bot.y -= BOX_SIDE;
			return true;
			break;
		case 'left':
			if(bot.dir != 'right'|| !l)
				return false;
			//move left
			if(bot.x <= 0)
				return false;
			bot.faceSide('left');
			for(var b in bot.box){
				bot.box[b].x -= BOX_SIDE;
			}
			bot.x -= BOX_SIDE;
			return true;
			break;
		case 'right':
			if(bot.dir != 'left'|| !r)
				return false;
			//move right
			if(bot.x + 3*BOX_SIDE >= PLAY_WIDTH)
				return false;
			bot.faceSide('right');
			for(var b in bot.box){
				bot.box[b].x += BOX_SIDE;
			}
			bot.x += BOX_SIDE;
			return true;
			break;
		case 'down':
			if(bot.dir != 'up'|| !d)
				return false;
			//move down
			if(bot.y + 3*BOX_SIDE >= PLAY_HEIGHT)
				return false;
			bot.faceSide('down');
			for(var b in bot.box){
				bot.box[b].y += BOX_SIDE;
			}
			bot.y += BOX_SIDE;
			return true;
			break;

	}
	alert('Something wrong/Control Should not reach here');
	return false;
}

possibleToMove = function(bot, direction){
	var x = 0, y = 0;
	if(direction == 'left')
		x = -BOX_SIDE;
	else if(direction == 'up')
		y = -BOX_SIDE;
	else if(direction == 'right')
		x = BOX_SIDE;
	else if(direction == 'down')
		y = BOX_SIDE;

	if(direction == 'left' && bot.x  <= 0)
		return false;
	if(direction == 'up' && bot.y <= 0)
		return false;
	if(direction == 'right' && bot.x + BOX_SIDE*3 >= PLAY_WIDTH)
		return false;
	if(direction == 'down' && bot.y + BOX_SIDE*3 >= PLAY_HEIGHT)
		return false;

	for(e in enemyList){
			if(Math.abs(enemyList[e].x - bot.x-x) > 3*BOX_SIDE || Math.abs(enemyList[e].y - bot.y-y) > 3*BOX_SIDE || enemyList[e]===bot)
				continue;
		for(b in enemyList[e].box){
			for(var b2 in bot.box){
				if(bot.box[b2].x+x == enemyList[e].box[b].x && bot.box[b2].y+y == enemyList[e].box[b].y)
					return false;
			}
		}
	}

	//check for possible collision with bricks

	for(var row in brickList){
		for(var col in brickList[row]){
			for(var b2 in bot.box){
					if(bot.box[b2].x+x == col*BOX_SIDE && bot.box[b2].y+y == row*BOX_SIDE)
						return false;
				}	
		}
	}

	if(bot.type == 'player'){
		return true;
	}
	for(var b in bot.box){
		for(var b2 in player.box){
			if(bot.box[b].x+x == player.box[b2].x && bot.box[b].y+y == player.box[b2].y){
				return false;
			}
		}
	}
	return true;

}
function drawBox(x,y){
	ctx.beginPath();
		ctx.fillStyle = 'rgba(0,0,0,0.06)';

		ctx.fillRect(x+2,y+2,BOX_SIDE-4,BOX_SIDE-4);
		ctx.fillStyle = 'black';
		ctx.fillRect(x+BOX_SIDE/3.5, y+BOX_SIDE/3.5, BOX_SIDE/7*3, BOX_SIDE/7*3);
		ctx.rect(x+2,y+2,BOX_SIDE-4,BOX_SIDE-4);
		ctx.stroke();
}
function box(x,y){
	this.x = x, this.y = y;
	this.render = function(){
		ctx.save();
		drawBox(this.x, this.y);
		ctx.restore();
	}
}
function bullet(x,y,direction){
	this.dir = direction;
	this.lastMoved = 0;
	this.bulet = new box(x,y);
	this.isHit = function(bot){
		//means bullet is too far from bot
		//we can ignore this if statement but it will make less calculations
		if(this.bulet.x < bot.x || this.bulet.x > bot.x + 3* BOX_SIDE || this.bulet.y < bot.y || this.bulet.y > bot.y + 3*BOX_SIDE)
			return false;

		//to check if bullet actually collides
		for(b in bot.box){
			if(bot.box[b].x == this.bulet.x && bot.box[b].y == this.bulet.y)
				return true;
		}
		return false;
	}
}
function bot(x,y,dir,type,speed,bulletSpeed,bulletGap){
	this.box = {};
	this.pause = false;
	this.lastBulletShotCounter = counter;
	this.lastMoved = 0;
	if(speed < 50)
		this.speed = speed;//max speed 50
	else
		this.speed = 50;
	this.bulletGap = bulletGap;
	this.movingLeft = false;
	this.movingRight = false;
	this.movingDown = false;
	this.movingUp = false;
	if(bulletSpeed < 50)
		this.bulletSpeed = bulletSpeed;
	else
		this.bulletSpeed = 50;

	this.shootingBullets = false;
	this.bulletList = [];
	this.type = type;
	for(var i=0;i<3;i++){
		for(var j=0;j<3;j++){
			if(dir == 'up' &&((i==0&&(j==0||j==2)) || (i==2 && j==1 && type =='enemy')))
				continue;
			else if(dir == 'down' && ((i==0 && j==1 && type == 'enemy')||(i==2&&(j==0||j==2))))
				continue;
			else if(dir == 'left' && ((j==0&&(i==0||i==2))||(i==1&&j==2 && type == 'enemy')))
				continue;
			else if(dir == 'right' && ((j==0&&i==1 && type == 'enemy')||(j==2&&(i==0||i==2))))
				continue;
			this.box[i*3 + j] = new box(x + j*BOX_SIDE, y + i*BOX_SIDE);
		}
	}
	this.x = x, this.y = y;
	this.dir = dir;
	this.faceSide = function(direction){
		this.box = {};
		for(var i=0;i<3;i++){
			for(var j=0;j<3;j++){
				if(direction == 'up' &&((i==0&&(j==0||j==2)) || (i==2 && j==1&& this.type == 'enemy')))
					continue;
				else if(direction == 'down' && ((i==0 && j==1&& this.type == 'enemy')||(i==2&&(j==0||j==2))))
					continue;
				else if(direction == 'left' && ((j==0&&(i==0||i==2))||(i==1&&j==2&& this.type == 'enemy')))
					continue;
				else if(direction == 'right' && ((j==0&&i==1&& this.type == 'enemy')||(j==2&&(i==0||i==2))))
					continue;
				this.box[i*3 + j] = new box(this.x + j*BOX_SIDE, this.y + i*BOX_SIDE);
			}
		}
	}
	this.render = function(){
		for(var b in this.box){
			this.box[b].render();
		}
		for(var b in this.bulletList){
			this.bulletList[b].bulet.render();
		}
	}
	this.isHit = function(bullet){
		if(bullet.isHit(this))
			return true;
		return false;
	}
	this.head = function(){
		var head = [{'x':0,'y':0}];
		if(this.dir == 'up'){
			head.x = this.x + BOX_SIDE;
			head.y = this.y;
			return head;
		}
		if(this.dir == 'left'){
			head.x = this.x;
			head.y = this.y + BOX_SIDE;
			return head;
		}
		if(this.dir == 'right'){
			head.x = this.x + 2*BOX_SIDE;
			head.y = this.y + BOX_SIDE;
			return head;
		}
		if(this.dir == 'down'){
			head.x = this.x + BOX_SIDE;
			head.y = this.y + 2*BOX_SIDE;
			return head;
		}

	}
	this.addBullet = function(){
		var head = this.head();
		this.bulletList[Math.random()] = new bullet(head.x, head.y, this.dir);
	}
	this.moveLeft = function(){
		//return true if actually moved, not just rotate, otherwise false
		if(this.dir != 'left'){
			if(faceDirection(this,'left')){
				this.dir = 'left';
				return true;
			}
			return false;
		}
		if(possibleToMove(this,'left')){
			for(var b in this.box){
				this.box[b].x -= BOX_SIDE;
			}
			this.x -= BOX_SIDE;
			return true;
		}
		return false;
	}
	this.moveRight = function(){
		if(this.dir != 'right'){
			if(faceDirection(this,'right')){
				this.dir = 'right';
				return true;
			}
			return false;
		}
		if(possibleToMove(this,'right')){
			for(var b in this.box){
				this.box[b].x += BOX_SIDE;
			}
			this.x += BOX_SIDE;
			return true;
		}
		return false;
	}
	this.moveUp = function(){
		if(this.dir != 'up'){
			if(faceDirection(this,'up')){
				this.dir = 'up';
				return true;
			}
			return false;
		}
		if(possibleToMove(this,'up')){
			for(var b in this.box){
				this.box[b].y -= BOX_SIDE;
			}
			this.y -= BOX_SIDE;
			return true;
		}
		return false;
	}
	this.moveDown = function(){
		if(this.dir != 'down'){
			if(faceDirection(this,'down')){
				this.dir = 'down';
				return true;
			}
			return false;
		}
		if(possibleToMove(this,'down')){
			for(var b in this.box){
				this.box[b].y += BOX_SIDE;
			}
			this.y += BOX_SIDE;
			return true;
		}
		return false;
	}
	
}
drawEnemy =function(){

	for(var e in enemyList){
		enemyList[e].render();
	}
}
drawPlayer = function(){

	if(!player.pause)
		player.render();
}
function drawEverything(){

	ctx.clearRect(0,0,WIDTH,HEIGHT);
	ctx.save();
	drawBackground();
	drawPlayer();
	drawEnemy();
	for(var i in brickList){
		for(var j in brickList[i]){
			drawBox(j*BOX_SIDE,i*BOX_SIDE);
		}
	}
	ctx.restore();
}
//enemyList[Math.random()]=new bot(BOX_SIDE*0,BOX_SIDE*0,'down','enemy',15,42,450);
//enemyList[Math.random()]=new bot(BOX_SIDE*3,BOX_SIDE*0,'down','enemy',10,25,10);
//enemyList[Math.random()]=new bot(BOX_SIDE*6,BOX_SIDE*0,'down','enemy',15,25,10);
//enemyList[Math.random()]=new bot(BOX_SIDE*9,BOX_SIDE*0,'down','enemy',5,25,10);
/*enemyList[Math.random()]=new bot(BOX_SIDE*12,BOX_SIDE*0,'down','enemy',41,47,0);
enemyList[Math.random()]=new bot(BOX_SIDE*0,BOX_SIDE*10,'down','enemy',48,47,0);
enemyList[Math.random()]=new bot(BOX_SIDE*3,BOX_SIDE*10,'down','enemy',48,47,0);
enemyList[Math.random()]=new bot(BOX_SIDE*6,BOX_SIDE*10,'down','enemy',48,47,0);
enemyList[Math.random()]=new bot(BOX_SIDE*9,BOX_SIDE*10,'down','enemy',48,47,0);
*///enemyList[Math.random()]=new bot(BOX_SIDE*12,BOX_SIDE*10,'down','enemy',5,20,0);
//enemyList[Math.random()]=new bot(BOX_SIDE*0,BOX_SIDE*14,'down','enemy',10,20,0);
/*enemyList[Math.random()]=new bot(BOX_SIDE*3,BOX_SIDE*14,'down','enemy',48,47,0);
enemyList[Math.random()]=new bot(BOX_SIDE*6,BOX_SIDE*14,'down','enemy',48,47,0);
enemyList[Math.random()]=new bot(BOX_SIDE*9,BOX_SIDE*14,'down','enemy',48,47,0);
enemyList[Math.random()]=new bot(BOX_SIDE*12,BOX_SIDE*14,'down','enemy',48,47,0);
enemyList[Math.random()]=new bot(BOX_SIDE*0,BOX_SIDE*18,'down','enemy',48,47,0);
enemyList[Math.random()]=new bot(BOX_SIDE*3,BOX_SIDE*18,'down','enemy',48,47,0);
enemyList[Math.random()]=new bot(BOX_SIDE*6,BOX_SIDE*18,'down','enemy',48,47,0);
enemyList[Math.random()]=new bot(BOX_SIDE*9,BOX_SIDE*18,'down','enemy',48,47,0);
enemyList[Math.random()]=new bot(BOX_SIDE*12,BOX_SIDE*18,'down','enemy',48,47,0);*/
updateVariables = function(){

	///first generate bullet for player
	if(button.space.pressed)
		if(counter - player.lastBulletShotCounter > player.bulletGap){
			sounds.bullet.currentTime=0;
			sounds.bullet.play();
			player.addBullet();
			player.lastBulletShotCounter = counter;
		}
	//now generate bullets for all the enemies
	for(var e in enemyList){
		//we'll make a random difference in the bullet shot timing difference for enemies
		//the time gap between bullet shots should not be constant
		//but it should be around a fixed value
		//50% to 150%
		if(counter - enemyList[e].lastBulletShotCounter > enemyList[e].bulletGap/2 + (Math.floor(Math.random()*(enemyList[e].bulletGap)))){
			//generate bullet
			enemyList[e].addBullet();
			enemyList[e].lastBulletShotCounter = counter;
		}
	}



	//first update player bullets
	////////////////////////////////////
		var hit = false;
		for(var b in player.bulletList){
			hit = false;
			if(counter - player.bulletList[b].lastMoved < 50 - player.bulletSpeed)
				continue;
			player.bulletList[b].lastMoved = counter;
			var direction = player.bulletList[b].dir;
			switch(direction){
				case 'up':
					player.bulletList[b].bulet.y -= BOX_SIDE;
					break;
				case 'left':
					player.bulletList[b].bulet.x -= BOX_SIDE;
					break;
				case 'down':
					player.bulletList[b].bulet.y += BOX_SIDE;
					break;
				case 'right':
					player.bulletList[b].bulet.x += BOX_SIDE;
					break;
			}
			if(player.bulletList[b].bulet.y < 0 ||player.bulletList[b].bulet.y >= PLAY_HEIGHT ||player.bulletList[b].bulet.x < 0 ||player.bulletList[b].bulet.x >= PLAY_WIDTH){
				delete(player.bulletList[b]);
				continue;
			}
			//first check collision with enemy
			for(var e in enemyList){
				//checks if the bullet hit any enemy
				if(enemyList[e].isHit(player.bulletList[b])){
					delete(player.bulletList[b]);
					delete(enemyList[e]);
					sounds.enemy.currentTime=0;
					sounds.enemy.play();
					//also increase score here
					//should be increased according to level
					score += 100+ 30*level;
					goal.completed++;
					if(goal.completed==goal.total){
						////go to next level
						action='nextLevel';
						player.pause=true;
					}
					hit = true;
					break;
				}
			}
			if(hit)
				continue;
			//check collision with bricks/walls that are inside
			for(var i in brickList){
				if(hit)
					break;
				for(var j in brickList[i]){
					if(player.bulletList[b].bulet.x == j*BOX_SIDE && player.bulletList[b].bulet.y == i*BOX_SIDE){
						sounds.wall.currentTime=0;
						sounds.wall.play();
						delete(brickList[i][j]);
						delete(player.bulletList[b]);
						hit = true;
						break;
					}
				}
			}
			if(hit)
				continue;
			for(var e in enemyList){
				if(hit)
					break;
				for(var b2 in enemyList[e].bulletList){
					if(enemyList[e].bulletList[b2].bulet.x == player.bulletList[b].bulet.x && enemyList[e].bulletList[b2].bulet.y == player.bulletList[b].bulet.y){
						delete(player.bulletList[b]);
						delete(enemyList[e].bulletList[b2]);
						hit = true;
						break;
					}
				}
			}
		}
		////here ends updating player bullets
		////////////////////////////////////////////////

		//////////////////////////////////////////
		//now update enemies bullets
		for(var enemy in enemyList){
		for(var b in enemyList[enemy].bulletList){
			hit = false;
			if(counter - enemyList[enemy].bulletList[b].lastMoved < 50 - enemyList[enemy].bulletSpeed)
				continue;
			enemyList[enemy].bulletList[b].lastMoved = counter;
			var direction = enemyList[enemy].bulletList[b].dir;
			switch(direction){
				case 'up':
					enemyList[enemy].bulletList[b].bulet.y -= BOX_SIDE;
					break;
				case 'left':
					enemyList[enemy].bulletList[b].bulet.x -= BOX_SIDE;
					break;
				case 'down':
					enemyList[enemy].bulletList[b].bulet.y += BOX_SIDE;
					break;
				case 'right':
					enemyList[enemy].bulletList[b].bulet.x += BOX_SIDE;
					break;
			}
			if(enemyList[enemy].bulletList[b].bulet.y < 0 ||enemyList[enemy].bulletList[b].bulet.y >= PLAY_HEIGHT ||enemyList[enemy].bulletList[b].bulet.x < 0 ||enemyList[enemy].bulletList[b].bulet.x >= PLAY_WIDTH){
				delete(enemyList[enemy].bulletList[b]);
				continue;
			}
			//first check collision with enemy//then we should just erase the bullet not enemy
			for(var e in enemyList){
				//checks if the bullet hit any enemy
				if(enemyList[e].isHit(enemyList[enemy].bulletList[b])){
					delete(enemyList[enemy].bulletList[b]);
					hit = true;
					break;
				}
			}
			if(hit)
				continue;
			//check collision with bricks/walls that are inside
			for(var i in brickList){
				if(hit)
					break;
				for(var j in brickList[i]){
					//drawBox(j*BOX_SIDE,i*BOX_SIDE);
					if(enemyList[enemy].bulletList[b].bulet.x == j*BOX_SIDE && enemyList[enemy].bulletList[b].bulet.y == i*BOX_SIDE){
						delete(enemyList[enemy].bulletList[b]);
						delete(brickList[i][j]);
						hit = true;
						break;
					}
				}
			}
			//now check for collision of enemy bullet and player bullet
			//if there is collision the remove both the bullets
			if(hit)
				continue;
			
			for(var b2 in player.bulletList){
				if(player.bulletList[b2].bulet.x == enemyList[enemy].bulletList[b].bulet.x && player.bulletList[b2].bulet.y == enemyList[enemy].bulletList[b].bulet.y){
					//delete both the bullets
					delete(player.bulletList[b2]);
					delete(enemyList[enemy].bulletList[b]);
					hit = true;
					break;
				}
			}
			if(hit)
				continue;
			////now check collision with player
			if(player.isHit(enemyList[enemy].bulletList[b])){
				hit = true;
				//////////////////////
				////////////////////
				//here do something to reduce the hp of player
				lives--;
				player.pause  = true;
				if(lives<=0){
					sounds.ending.currentTime=0
					sounds.ending.play();
					action='homePage';
				}
				else
					action='continue';
				delete(enemyList[enemy].bulletList[b]);
			}
		}
	}

//////////////////here ends the updation of enemy bullets
///////////////////////////////////////////////////////


	//first update which key, make true only which is most recently pressed;
	b=mostRecentButtonPressed();
	//then move player in that direction
	switch(b){
		case 'left':player.movingLeft = true;
			player.movingDown = player.movingRight = player.movingUp = false;
			break;
		case 'right':player.movingRight = true;
			player.movingDown = player.movingLeft = player.movingUp = false;
			break;
		case 'up':player.movingUp = true;
			player.movingDown = player.movingRight = player.movingLeft = false;
			break;
		case 'down':player.movingDown = true;
			player.movingLeft = player.movingRight = player.movingUp = false;
			break;
		default:player.movingDown = player.movingLeft = player.movingRight = player.movingUp = false;
			break;
	}

	//now update player//if player is paused then we'll not move player
	if(counter - player.lastMoved > 50-player.speed && player.pause == false){
		var isMoved = false;
		//only reset lastMoved if player actually moved
		if(player.movingLeft)
			isMoved = player.moveLeft();
		else if(player.movingDown)
			isMoved = player.moveDown();
		else if(player.movingRight)
			isMoved = player.moveRight();
		else if(player.movingUp)
			isMoved = player.moveUp();
		if(isMoved){
			player.lastMoved = counter;
		}
	}
	//now update enemy
	for(var e in enemyList){
		if(counter - enemyList[e].lastMoved > 50-enemyList[e].speed && enemyList[e].pause == false){
			var isMoved = false;
				//now choose any random direction for enemy to move//
				//we will make more chances for him to move in the previous moving direction so that enemy won't be
				//just moving zigzag or just rotating in same place
				//we generate random number between 0 and 3
				//so we added 0.99 so that chances of 5 also become equal
				//if 0,1,2,3 the generated direction otherwise previous direction
				var dir = Math.abs(Math.floor(Math.random()*ENEMY_MOVEMENT));
				if(dir > 3){
					dir = enemyList[e].dir;
				}
				else
					dir = directions[dir];
				switch(dir){
					case 'left':
						isMoved = enemyList[e].moveLeft();
						break;
					case 'right':
						isMoved = enemyList[e].moveRight();
						break;
					case 'up':
						isMoved = enemyList[e].moveUp();
						break;
					case 'down':
						isMoved = enemyList[e].moveDown();
						break;
				}
				if(isMoved){
					enemyList[e].lastMoved = counter;
				}
				else
					enemyList[e].lastMoved = counter - (counter - enemyList[e].lastMoved);

		}
	}
/////////////////////////////////////////////////////////
///////here we are making the bullets of every enemy in sync
//first we'll find the bullet of an enemy that was moved least recently
///it'll just make sure that the bullet whose time we're taking
//is not the last generated bullet
	var enemyCount = 0;
	for(var e in enemyList){
	enemyCount++;
	var bulletLastMoved = counter+1;//the biggest possible time for any bullet is counter
	for(var b in enemyList[e].bulletList){
		if(enemyList[e].bulletList[b].lastMoved < bulletLastMoved){
			bulletLastMoved = enemyList[e].bulletList[b].lastMoved;
		}
	}
	///here we'll have the least timing in bulletLastMoved
	//we'll make all bullets timing the same
	//so that they will be in sync
	for(var b in enemyList[e].bulletList){
			enemyList[e].bulletList[b].lastMoved = bulletLastMoved;
		}
	}

	if(enemyCount < goal.total-goal.completed)
	if(enemyCount<6 && counter%500==0)
		createEnemy(speed);
	else if(enemyCount < 5 && counter%50==0)
		createEnemy(speed);
	///here we'll check is the player lost hp
	///then we'll pause and blast the player
	if(player.pause){
		if(action=='nextLevel'){
			applyAction(action);
		}
		else{
			if(blastPlayer(player.x,player.y)){
				applyAction(action);
				sounds.blast.currentTime=0;
			}
		}
		
	}


}
function applyAction(p_action){
	if(action=='homePage'){
		clearInterval(animateInterval);
		mainPage();
	}
	else{
		clearInterval(animateInterval);
		animateInterval = setInterval(dropCurtain,1000/FPS);
	}
}
update = function(){
	if(!sounds.levelChange.ended){
		pause = false;
		if(Math.abs(sounds.levelChange.currentTime-5.13)<0.01){
			sounds.levelChange.currentTime =6;
		}
	}
	if(!pause){
	counter++;
	updateVariables();
	drawEverything();
	if(pauseCounter)
		pauseCounter = 0;
	}
	else{
		displayPause();
		pauseCounter++;
	}
}
document.addEventListener('keydown',function(event){
	//65 A, 37-left, 83-s 40-down, 68-d, 96-right, 87-w, 38-up

	switch(event.keyCode){
		case 65:
		case 37:
			button.left.pressed = true;
			button.left.pressedTime = counter;
		break;
		case 83:
		case 40:
			button.down.pressed = true;
			button.down.pressedTime = counter;
		break;
		case 68:
		case 39:
			button.right.pressed = true;
			button.right.pressedTime = counter;
		break;
		case 87:
		case 38:
			button.up.pressed = true;
			button.up.pressedTime = counter;
		break;
		case 32:
			button.space.pressed = true;
		break;
		case 13:
			button.enter.pressed = true;
			pause = !pause;
			break;
		case 27:
			button.esc.pressed = true;
			sounds.blast.pause();
			sounds.levelChange.pause();
			clearInterval(animateInterval);
			lives=0;
			goal.completed=0;
			goal.total=0;
			mainPage();
			break;
}
});
document.addEventListener('keyup',function(event){
	switch(event.keyCode){
		case 65:
		case 37:
			button.left.pressed = false;
			button.left.releaseTime = counter;
			break;
		case 83:
		case 40:
			button.down.pressed = false;
			break;
		case 68:
		case 96:
			button.right.pressed = false;
			button.right.releaseTime=counter;
			break;
		case 87:
		case 38:
			button.up.pressed = false;
			break;
		case 32:
			button.space.pressed = false;
			break;
		case 13:
			button.enter.pressed = false;
			break;
		case 27:
			button.esc.pressed = false;
			break;
	}
});
drawLetter = function(p_letter){
	var p_side = 0;
	var p_gap=6;
	//first check which side the font is facing
	if((counter)%(p_gap*11)==0||(counter+p_gap*4)%(p_gap*11)==0||(counter+p_gap*8)%(p_gap*11)==0||(counter+p_gap*9)%(p_gap*11)==0||(counter+p_gap*10)%(p_gap*11)==0||counter<p_gap){
		p_side = 1;
	}
	else if((counter+p_gap)%(p_gap*11)==0||(counter+p_gap*3)%(p_gap*11)==0||(counter+p_gap*5)%(p_gap*11)==0||(counter+p_gap*7)%(p_gap*11)==0){
		p_side =2;
	}
	else if((counter+p_gap*2)%(p_gap*11)==0||(counter+p_gap*6)%(p_gap*11)==0){
		p_side =3;
	}
	//0,4,8,
	if(p_side==1){
		for(p_row = 4;p_row<=8;p_row++){
			for(p_col=5;p_col<=9;p_col++){
				if((p_col==5||p_col==9)&&p_row!=4||p_row==6||(p_row==4&&(p_col==6||p_col==8)))
					brickList[p_row][p_col]=1;
				else
					delete(brickList[p_row][p_col]);
			}
		}
	}//1,3,5,7,
	else if(p_side==2){
		for(p_row=4;p_row<=9;p_row++){
			delete(brickList[p_row][5]);
			delete(brickList[p_row][7]);
			delete(brickList[p_row][9]);
		}
		for(p_row=4;p_row<=8;p_row++){
			brickList[p_row][6]=brickList[p_row][8]=1;
		}
	}//2,6,
	else if(p_side==3){
		for(p_row=4;p_row<=9;p_row++){
			delete(brickList[p_row][5]);
			delete(brickList[p_row][6]);
			delete(brickList[p_row][8]);
			delete(brickList[p_row][9]);
		}
		for(p_row=4;p_row<=8;p_row++){
			brickList[p_row][7]=1;
		}
	}

	brickList[3][7]=brickList[6][7]=1;
}
drawAnimation = function(p_letter){
	//function bot(x,y,dir,type,speed,bulletSpeed,bulletGap)
	var p_gap=10;
	var enemyExists=false;
	for(var e in enemyList){
		enemyExists=true;
	}
	if(!enemyExists){
		enemyList[0]=new bot(0,17*BOX_SIDE,'up','enemy',0,0,1000);
		enemyList[1]=new bot(PLAY_WIDTH-3*BOX_SIDE,11*BOX_SIDE,'left','enemy',0,0,1000);
		enemyList[2]=new bot(PLAY_WIDTH-3*BOX_SIDE,PLAY_HEIGHT-3*BOX_SIDE,'left','player',0,0,1000);
	}
	

	if(counter%(p_gap*7)==0){
		enemyList[1].x = PLAY_WIDTH-3*BOX_SIDE;
		enemyList[1].y = 11*BOX_SIDE;
		enemyList[1].faceSide('left');

		enemyList[2].x = PLAY_WIDTH-3*BOX_SIDE;
		enemyList[2].y = PLAY_HEIGHT-3*BOX_SIDE;
		enemyList[2].faceSide('left');
		for(var row =0;row<=3;row++){
			for(var col=0;col<=3;col++){
				if(row==col|| row+col==3){
					delete(brickList[11+row][PLAY_WIDTH/BOX_SIDE-6+col]);
				}
			}
		}

	}
	else if((counter+p_gap*6)%(p_gap*7)==0){
		
		for(var b in enemyList[1].box){
				enemyList[1].box[b].x -= 3*BOX_SIDE;
			}
			enemyList[1].x -= 3*BOX_SIDE;

	}
	else if((counter+p_gap*5)%(p_gap*7)==0){
		enemyList[2].moveLeft();
		enemyList[2].moveLeft();
		brickList[15][1]=1;
	}
	else if((counter+p_gap*4)%(p_gap*7)==0){
		enemyList[2].faceSide('up');
		
		brickList[11][1]=1;
		delete(brickList[15][1]);
	}
	else if((counter+p_gap*3)%(p_gap*7)==0){
		//draw bullets
		enemyList[1].faceSide('down');
		brickList[18][11]=1;
		delete(brickList[11][1]);
	}
	else if((counter+p_gap*2)%(p_gap*7)==0){
		//draw bullets
		brickList[13][11]=1;
		delete(brickList[18][11]);
	}
	else if((counter+p_gap)%(p_gap*7)==0){
		//make a blast here just draw
		delete(brickList[13][11]);
		//enemy should not be visible
		for(var b in enemyList[1].box){
				enemyList[1].box[b].x -= 100*BOX_SIDE;
			}
			enemyList[1].x -= 3*BOX_SIDE;

		for(var row =0;row<=3;row++){
			for(var col=0;col<=3;col++){
				if(row==col|| row+col==3){
					brickList[11+row][PLAY_WIDTH/BOX_SIDE-6+col]=1;
				}
			}
		}
	}
	drawEnemy();
}
mainPageUpdate = function(){
	counter++;
	//draw main page
	ctx.clearRect(0,0,WIDTH,HEIGHT);
	ctx.save();
	drawBackground();
	for(var i in brickList){
		for(var j in brickList[i]){
			drawBox(j*BOX_SIDE,i*BOX_SIDE);
		}
	}
	ctx.restore();
	//draw big letter
	drawLetter('A');
	drawAnimation('A');
	if(button.enter.pressed){
		clearInterval(animateInterval);
		enemyList={};
		for(var row in brickList)
			for(var col in brickList[row])
				delete(brickList[row][col]);
		createPlayer(speed);
		//unds.levelChange.currentTime=0;
		//sounds.levelChange.play();
		sounds.starting.pause();
		curtainCounter=-23;
		action='new';
		applyAction('new');
	}
	else if(button.right.pressed&&button.right.pressedTime==counter-1){
		speed++;
		sounds.change.currentTime=0
		sounds.change.play();
		
		if(speed>10)
			speed = 1;
	}
	else if(button.left.pressed&&button.left.pressedTime==counter-1){
		level++;
		sounds.change.currentTime=0
		sounds.change.play();
		if(level>10)
			level = 1;
	}
}

startGame = function(type,p_level,p_speed){
	delete(player);
	clearInterval(animateInterval);
	enemyList={};
	if(p_level!=0&&p_speed!=0){
		level = p_level;
		speed = p_speed;
	}
	if(type=='new'){
		score=0;
		goal.completed = 0;
		goal.total = 50
		lives = 4;
	}
	else if(type == 'nextLevel'){
		goal.completed = 0;
		goal.total = 50;
		speed++;
		level++;

		if(level>10)
			level = 1;
		if(speed>10)
			speed = 1;
	}
	createPlayer(speed);
	animateInterval = setInterval(update,1000/FPS);
}
mainPage = function(){
	var elem = document.getElementById('playbutton');
    if(elem != null)
    	elem.parentNode.removeChild(elem);
	counter = 0;
	score =0;
	level=1;
	speed=1;
	goal.completed=0;
	goal.total=0;
	delete(player);
	enemyList={};
	for(p_row in brickList){
		for(p_col in brickList[p_row]){
			delete(brickList[p_row][p_col]);
		}
	}
	animateInterval = setInterval(mainPageUpdate,1000/FPS);

	sounds.starting.currentTime = 0;
	sounds.starting.play();
}
//mainPage();