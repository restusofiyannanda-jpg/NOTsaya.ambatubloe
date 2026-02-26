const ROW=20, COL=12, SIZE=20;
const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

let board=[], piece=null, pos=null;
let score=0, interval=null;

// AUDIO
let bgMusic = new Audio("https://ia800905.us.archive.org/15/items/TetrisThemeMusic/Tetris.mp3");
bgMusic.loop = true;
bgMusic.volume =0.6;

function startMusic(){
    bgMusic.currentTime = 0;
    bgMusic.play().catch(()=>{});
}

function toggleMusic(){
    if(bgMusic.paused){
        bgMusic.play();
    } else {
        bgMusic.pause();
    }
}

// PIECES
const pieces=[
{shape:[[1,1,1,1]],color:"cyan"},
{shape:[[1,1],[1,1]],color:"yellow"},
{shape:[[0,1,0],[1,1,1]],color:"purple"},
{shape:[[1,0,0],[1,1,1]],color:"blue"},
{shape:[[0,0,1],[1,1,1]],color:"orange"},
{shape:[[1,1,0],[0,1,1]],color:"red"},
{shape:[[0,1,1],[1,1,0]],color:"lime"}
];

function initBoard(){
    board=[];
    for(let r=0;r<ROW;r++)
        board[r]=Array(COL).fill("");
}

function randomPiece(){
    return JSON.parse(JSON.stringify(
        pieces[Math.floor(Math.random()*pieces.length)]
    ));
}

function drawSquare(x,y,color){

    let px = x*SIZE;
    let py = y*SIZE;

    let gradient = ctx.createLinearGradient(px,py,px+SIZE,py+SIZE);
    gradient.addColorStop(0,"white");
    gradient.addColorStop(0.3,color);
    gradient.addColorStop(1,"black");

    ctx.fillStyle = gradient;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;

    ctx.fillRect(px,py,SIZE,SIZE);

    ctx.shadowBlur = 0;
    ctx.strokeStyle="rgba(0,0,0,0.6)";
    ctx.strokeRect(px,py,SIZE,SIZE);

    ctx.fillStyle="rgba(255,255,255,0.3)";
    ctx.fillRect(px+2,py+2,SIZE/3,SIZE/3);
}

function draw(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle="rgba(255,255,255,0.05)";
    for(let r=0;r<ROW;r++)
        for(let c=0;c<COL;c++)
            ctx.strokeRect(c*SIZE,r*SIZE,SIZE,SIZE);

    for(let r=0;r<ROW;r++)
        for(let c=0;c<COL;c++)
            if(board[r][c])
                drawSquare(c,r,board[r][c]);

    piece.shape.forEach((row,r)=>{
        row.forEach((val,c)=>{
            if(val)
                drawSquare(pos.x+c,pos.y+r,piece.color);
        });
    });
}

function collision(dx,dy,shape){
    for(let r=0;r<shape.length;r++)
        for(let c=0;c<shape[r].length;c++)
            if(shape[r][c]){

                let x=pos.x+c+dx;
                let y=pos.y+r+dy;

                if(x<0||x>=COL||y>=ROW)
                    return true;

                if(y>=0 && board[y][x])
                    return true;
            }
    return false;
}

function merge(){
    piece.shape.forEach((row,r)=>{
        row.forEach((val,c)=>{
            if(val){
                let y=pos.y+r;

                if(y<0){
                    endGame();
                    return;
                }

                board[y][pos.x+c]=piece.color;
            }
        });
    });
}

function clearLines(){

    for(let r=ROW-1;r>=0;r--){

        if(board[r].every(cell=>cell)){

            board.splice(r,1);
            board.unshift(Array(COL).fill(""));

            score+=100;

            document.getElementById("score").innerText=score;

            r++;
        }
    }
}

function move(dir){

    if(!collision(dir,0,piece.shape))
        pos.x+=dir;

    draw();
}

function drop(){

    if(!collision(0,1,piece.shape))
        pos.y++;

    else{

        merge();
        clearLines();

        piece=randomPiece();
        pos={x:4,y:-1};

        if(collision(0,1,piece.shape))
            endGame();
    }

    draw();
}

function rotate(){

    let newShape =
    piece.shape[0].map((_,i)=>
        piece.shape.map(row=>row[i]).reverse()
    );

    if(!collision(0,0,newShape))
        piece.shape=newShape;

    draw();
}

function startGame(){

    document.getElementById("menu").classList.add("hidden");
    document.getElementById("gameOver").classList.add("hidden");

    score=0;
    document.getElementById("score").innerText=0;

    initBoard();

    piece=randomPiece();

    pos={x:4,y:-1};

    clearInterval(interval);

    interval=setInterval(drop,800);

    startMusic();

    draw();
}

function endGame(){

    clearInterval(interval);

    bgMusic.pause();

    document.getElementById("finalScore").innerText="Score kamu: "+score;

    document.getElementById("gameOver").classList.remove("hidden");
}

// SWIPE CONTROL
let startX=0,startY=0;

canvas.addEventListener("touchstart",e=>{
    startX=e.touches[0].clientX;
    startY=e.touches[0].clientY;
});

canvas.addEventListener("touchend",e=>{

    let dx=e.changedTouches[0].clientX-startX;
    let dy=e.changedTouches[0].clientY-startY;

    if(Math.abs(dx)>Math.abs(dy)){

        if(dx>30) move(1);

        if(dx<-30) move(-1);
    }
    else{

        if(dy>30) drop();

        if(dy<-30) rotate();
    }
});
