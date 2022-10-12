const container = document.querySelector(".mainContainer");
let width = window.innerWidth;
let height = window.innerHeight;
//html elements:
const paddle = document.querySelector(".paddle");
const ball = document.querySelector(".ball");
const score = document.getElementById("score");
const heartContainer = document.querySelector(".lifeContainer");
const windowOver = document.querySelector(".gameOver");
const levelCounter = document.getElementById("level");
const highscoreCounter = document.getElementById("highscore");
const fpsdisplay = document.getElementById("fpsdisplay");
const fps = document.getElementById("fps");
const showdelta = document.getElementById("showdelta");
const ballstat = document.getElementById("ballstat")
const blockWidth = 85 * (width/1920);
const blockHeight = 30 * (width/1920);
const spacing = 0.0035; //in %
//properties to keep track of gameplay:
let spacingTop = 0.1; //in %
let numOfBlocks = 20*3;
let blockList = [];
let paddlePos = 0.5;
let paddleScale = 0.08;
let ballPos = [0.5, 0.8225];
let ballDir = [0,0];
let speed = 0.0005;
let ballSpeed = 0.5;
let points = 0;
let blocksDestroyed = 0;
let lifes = 2;
let level = 1;
let ballParented = true;
let movement = [false, false];
let specialBlocksAmount = [3]; //heart,
let lowestBlock;
let rainbowActive = false;
//sounds:
const blip = new Audio("blip.wav");
const rebound = [new Audio("rebound.wav")];
const destroy = [new Audio("blockdestroy1.wav")];
const hurt = [new Audio("hurt1.wav"), new Audio("hurt2.wav")];
const won = new Audio("won.wav");
//timing:
let deltaTime = 0;
let lastTime = 0;
let lastFps = 1000;
//key combos
let shiftPressed = false;
let balldebug = false;



document.addEventListener('resize', () => {
    width = container.clientWidth;
    height = container.clientHeight;
})

//Sounds
function playRebound(){
    let rnd = Math.floor(Math.random()*(rebound.length));
    rebound[rnd].play();
}
function playDestroy(){
    let rnd = Math.floor(Math.random()*(destroy.length));
    destroy[rnd].play();
}
function playHurt(){
    let rnd = Math.floor(Math.random()*(hurt.length));
    hurt[rnd].play();
}

//keys
function keyCheck(e){
    console.log(e.keyCode)
    switch(e.keyCode){
        case 37: //left arrow <-
            movement[0] = true;
            break;
        case 39: //right arrow ->
            movement[1] = true;
            break;
        case 32: //spacebar
            if(lifes > 0 && ballParented){
                ballDir[0] = (Math.random()-0.5)/3000;
                ballDir[1] = -0.001;
                ballParented = false;
            }
            break;
        case 107: //plus numpad
            nextLevel();
            break;
        case 16: //shift
            shiftPressed = true;
            break;
        case 70: //F (if shift is also pressed show fps)
            if(shiftPressed){
                if(fpsdisplay.style.display == "block"){
                    fpsdisplay.style.display = "none";
                }else {
                    fpsdisplay.style.display = "block";
                }
            }
            break;
        case 66:
            if(shiftPressed){
                balldebug = !balldebug
                if(balldebug){
                    ballstat.style.display = "block"
                }else{
                    ballstat.style.display = "none"
                }
            }
    }
}
function keyRelease(e){
    switch(e.keyCode){
        case 37:
            movement[0] = false;
            break;
        case 39:
            movement[1] = false;
            break;
        case 16: //shift
            shiftPressed = false;
            break;
    }
}

class block{
    constructor(xAxis, yAxis, id){
        this.x = xAxis;
        this.y = yAxis;
        this.id = id;
    }
}

//create block-array
function createBlocks(){
    for(let i = 0; i<numOfBlocks; i++){
        let x = i - Math.floor(i/20)*20;
        let y = Math.floor(i/20);
        blockList.push(new block(x,y,i));
    }
    console.log(blockList)
    lowestBlock = blockList[blockList.length-1].y
    addBlocks();
}

//create Blocks
function addBlocks(){
    for(let i = 0; i<numOfBlocks; i++){
        const block = document.createElement('div');
        block.id = blockList[i].id;
        let rnd = Math.floor(Math.random()*1000);
        if(rnd <= 100 && document.getElementsByClassName("heartblock").length < specialBlocksAmount[0]){
            block.classList.add('heartblock');
            block.title = "+1 life"
        }else if(rnd >= 990 && level > 1){
            block.classList.add('scaleblock')
            block.title = "+2vw paddle with"
        }else if(rnd >= 985 && rnd <990 && level >1){
            block.classList.add('shrinkblock')
            block.title = "-2vw paddle with"
        }else if(rnd == 101 && level > 1){
            block.classList.add("rainbowblock")
            block.title ="7sec invincible ball"
        }else if(rnd >=980 && rnd <985 && level >1){
            block.classList.add("slowblock")
            block.title ="-10% speed"
        }else if(rnd >=975 && rnd <980 && level >1){
            block.classList.add("fastblock")
            block.title ="+10% speed"
        }else if(rnd == 102 || rnd == 103 && level > 1){
            block.classList.add("plusten")
            block.title = "+10 points"
        }
        else{
            block.classList.add('block');
            block.title = "+1 point"
        }
        block.style.left = `calc(${i - Math.floor(i/20)*20} * ((100vw - 21 * ${spacing} * 100vw) / 20) + ${spacing} * 100vw * ${i - Math.floor(i/20)*20 + 1})`;
        block.style.top = `calc(${Math.floor(i/20)} * 100vh / 30 + (${spacingTop} * 100vh) + ${Math.floor(i/20)*spacing} * 100vh)`;
        block.style.width = `calc((100vw - 21 * ${spacing} * 100vw) / 20)`;
        block.style.height = `calc(100vh / 30)`; //value isnt correct also top need changing
        container.appendChild(block);
    }
}

//update paddle
function refreshPaddle(){
    if(movement[0] && (paddlePos > paddleScale/2)){
        if(paddlePos - speed*deltaTime < 0+(paddleScale/2)){ //exactly stop on the left edge
            paddlePos = paddleScale/2
        }else {
            paddlePos -= speed*deltaTime;
        }
    }
    if(movement[1] && (paddlePos < 1-(paddleScale/2))){
        if(paddlePos + speed*deltaTime > 1-(paddleScale/2)){ //exactly stop on the right edge
            paddlePos = 1-(paddleScale/2)
        }else{
            paddlePos += speed*deltaTime;
        }

    }
    paddle.style.left = `calc(100vw * ${paddlePos})`;
    if(ballParented){
        ballPos = [paddlePos, 0.8225];
        refreshBall();
    }
}

function refreshPaddleWidth(){
    paddle.style.width = `calc(100vw * ${paddleScale})`
}

//update ball
function refreshBall(){
    ball.style.left = `calc(100vw * ${ballPos[0]})`;
    ball.style.top = `calc(100vh * ${ballPos[1]})`;
}



//moving the ball (basically the main render loop)
function moveBall(passedTime){
    deltaTime = passedTime - lastTime;
    lastTime = passedTime;
    lastFps += deltaTime;
    if(lastFps >= 250){
        fps.innerHTML = `${Math.floor(1000/deltaTime)} FPS`;
        showdelta.innerHTML = `${Math.floor(deltaTime*100)/100}ms`;
        lastFps = 0;
    }

    let moveX = ballDir[0]*ballSpeed*deltaTime;
    let moveY = ballDir[1]*ballSpeed*deltaTime;
    ballPos[0] += moveX;
    ballPos[1] += moveY;

    let blocksOfInterest = blockList.filter(item => {
        return Math.abs(ballPos[0] - (item.x+0.5)/20) <0.07 && Math.abs(ballPos[1] - (item.y+0.5)/30 - spacingTop) < 0.1
        //Math.abs(ballPos[0] - (item.x+0.5)/20) < 0.15 && Math.abs(ballPos[1] - (item.y+0.5)/30) < 0.15
    })

    ballstat.innerHTML = `${blocksOfInterest.length} Blocks in range`

    if(balldebug){ //outline all blocks in range
        for(let block of blockList){
            if(blocksOfInterest.filter(i => {return i.id == block.id}).length == 1){
                document.getElementById(block.id).classList.add("markedblock")
            }else{
                document.getElementById(block.id).classList.remove("markedblock")
            }
        }
    }
    
    for(let block of blocksOfInterest){
        let currentBlock = document.getElementById(block.id);
        //collision with block: check if ballPos is NOT outside of the block
        let col = !(ballPos[1] - 0.015 + moveY > ((block.y+1)/30 + spacingTop)
                || ballPos[1] + 0.015 + moveY < ((block.y/30) + spacingTop)
                ||ballPos[0] + 0.0084 + moveX < block.x/20
                || ballPos[0] - 0.0084 + moveX> (block.x+1)/20
                );

        //change direction dependent on impact:
        if(!ballParented && col && currentBlock){
            if(!rainbowActive && (ballPos[0]+0.0084 < block.x/20 || ballPos[0]-0.0084 > (block.x+1)/20))
                { 
                ballDir[0] *= -1;
                console.log("x reflection")
            }else{
                if(!rainbowActive){
                    ballDir[1] *= -1;
                    console.log("y reflection")
                }
            }

            if(currentBlock?.classList.contains("heartblock")){ //collision with heartblock
                if(lifes < 10){
                    lifes++;
                    addHeart();
                    won.play();
                }else{
                    won.play();
                    points += 20; //bonuspoints, if already 10 lifes
                    score.innerHTML = points;
                }
            }else if(currentBlock?.classList.contains("scaleblock")){
                paddleScale += 0.02;
                refreshPaddleWidth();
            }else if(currentBlock?.classList.contains("shrinkblock")){
                if(paddleScale <= 0.02){
                    removeHeart();
                }else {
                    paddleScale -= 0.02;
                    refreshPaddleWidth();
                }
            }else if(currentBlock?.classList.contains("slowblock")){
                speed *= 0.9;
                ballSpeed *= 0.9;
            }else if(currentBlock?.classList.contains("fastblock")){
                speed *= 1.1;
                ballSpeed *= 1.1;
            }else if (currentBlock?.classList.contains("plusten")){
                points+=9;
            }else if (currentBlock?.classList.contains("rainbowblock")){
                ball.classList.add("rainbowblock");
                rainbowActive = true;
                ballSpeed *= 2
                setTimeout(() => {
                    blip.play();
                    ball.classList.remove("rainbowblock");
                    setTimeout(() => ball.classList.add("rainbowblock"), 50)
                }, 5000)
                setTimeout(() => {
                    blip.play();
                    ball.classList.remove("rainbowblock");
                    setTimeout(() => ball.classList.add("rainbowblock"), 50)
                }, 6000)
                setTimeout(() => {
                    blip.play();
                    ball.classList.remove("rainbowblock");
                    rainbowActive = false;
                    ballSpeed /= 2;
                }, 7000)
            }
            currentBlock?.parentNode.removeChild(currentBlock);
            blockList = blockList.filter(item => {return item.id!== block.id});
            points++;
            highscoreCheck();
            blocksDestroyed++;
            score.innerHTML = points; //add & update score
            playDestroy();
            if(blocksDestroyed == numOfBlocks){
                nextLevel();
            }
            break;
        }
    }
    if(!ballParented //collision with paddle
        && ballPos[1]+0.015+ moveY > 0.8375
        && ballPos[1]-0.015 + moveY < 0.8625
        && ballPos[0]-0.0084+ moveX < paddlePos+(paddleScale/2)
        && ballPos[0]+0.0084+ moveX > paddlePos-(paddleScale/2))
        { 
        ballDir[1] *= -1;
        ballDir[0] = ((ballPos[0]-paddlePos)/75)
        //if the ball "glitchtes" inside the paddle (like by moving the paddle inside it) move the ball on top or below the paddle
        if(ballPos[1]+0.015 >0.8375 && ballPos[1]-0.015 < 0.8775){
            if(ballPos[1] <= 0.85){
                ballPos[1]=0.8225;
                console.log("inside top");
            }else {
                ballPos[1]=0.8775;
                console.log("inside bottom")
            }
        }
        playRebound();
    }
    if(ballPos[1]+0.015+ moveY >= 0.9){ //when moving below paddle -> reflect if rainbow ball is active
        if(rainbowActive){
            ballDir[1] *= -1;
            playRebound();
        }else {
            parentBall();
            removeHeart();
        }
    }
    if(ballPos[0]-0.0084+moveX < 0 || ballPos[0]+0.0084+moveX >= 1){ //reflect on edge of window
        ballDir[0] *= -1;
        playRebound();
    }
    if(ballPos[1]-0.015+moveY< 0){ //reflect on top of playing field
        ballDir[1] *= -1;
        playRebound();
    }
    refreshBall();
    refreshPaddle();
    requestAnimationFrame(moveBall);
}

function parentBall(){
    ballDir = [0,0];
    ballParented = true;
}

//create next level
function nextLevel(){
    won.play();
    parentBall();
    if(lifes < 10){ //adds life
        lifes++;
        addHeart();
    }else{
        points += 20; //bonuspoints, if already 10 lifes
        score.innerHTML = points;
    }

    level++;
    levelCounter.innerHTML = level;

    for(let i = 0; i<numOfBlocks; i++){ //remove all block div's
        let toRemove = document.getElementById(i)
        if(toRemove != null){
            toRemove.parentNode.removeChild(toRemove);
        }
    }

    let removeThis = document.querySelector(".levelShow");
    removeThis.parentNode.removeChild(removeThis);
    blockList = [];
    blocksDestroyed = 0;
    let levelShow = document.createElement("div");
    levelShow.innerHTML = "level " + level;
    levelShow.classList.add("levelShow");
    document.body.appendChild(levelShow);

    if(ballSpeed < 1){ //raise speeds
        ballSpeed += 0.0625;
        speed *= 1.05;
    }
    if(specialBlocksAmount[0] < 12){ //set amount of special blocks to be spawned
        specialBlocksAmount[0] = 2 + Math.floor(level/2);
    }

    spacingTop *= 0.9

    if(numOfBlocks < 20*18){ //raise number of blocks to be spawned
        numOfBlocks = Math.floor(level/2)*20 + 20*3;
    }
    createBlocks();
}

function removeHeart(){
    let hrtId = `heart${lifes-1}`;
    let removehrt = document.getElementById(hrtId);
    removehrt.parentNode.removeChild(removehrt);
    lifes--;
    //remove lifes and check for lifes left
    playHurt();
    if(lifes == 0){
        windowOver.style.display = "flex";
        ball.style.display="none";
    }
}

//adds a new heart to the info container
function addHeart(){
    let heart = document.createElement("i")
    heart.classList.add("fa-solid")
    heart.classList.add("fa-heart")
    heart.id = `heart${lifes-1}`
    heartContainer.appendChild(heart);
}

//manages the highscore
function highscoreCheck(){
    let cok = document.cookie;
    if(cok < points){
        document.cookie = points;
        highscoreCounter.innerHTML = points;
    }
}



window.requestAnimationFrame(moveBall);
createBlocks();
refreshPaddle();
refreshBall();
refreshPaddleWidth();
document.addEventListener("keydown", keyCheck);
document.addEventListener("keyup", keyRelease);

//initialize hearts
for(let i = 0; i<lifes; i++){
    let heart = document.createElement("i")
    heart.classList.add("fa-solid")
    heart.classList.add("fa-heart")
    heart.id = `heart${i}`
    heartContainer.appendChild(heart);
}

//initialize highscore
if(navigator.cookieEnabled){
    if(document.cookie != ""){
        highscoreCounter.innerHTML = document.cookie;
    }
}else{
    alert("Cookies are disabled. To display and save the highscore, you have to enable them!");
}

//Check for Screen Resolution
//if(screen.width != 2560 || screen.height != 1440){
//    alert("This monitor: " + screen.width + "x" + screen.height 
//    + "\n\n🇬🇧\nThis application was designed to run on a WQHD monitor with an aspect ratio of 16:9. Nevertheless you should still be able to play without problems.\n\n🇩🇪\nDie Anwendung wurde für WQHD-Monitore mit einem Seitenverhältniss von 16:9 designed. Trotzdem solltest du ohne Probleme spielen können.")
//}