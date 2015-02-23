/* This program takes any image that is at least 400 by 400 pixels and in square format and turns it into the fifteen puzzle. I used the HTML5 canvas as the board to move and display the pieces. The images in the image folder are photographs that I have taken, which you can test the program with but it will work with any image. 

This is the first version of the program so it currently does not have any styling or error messages for improper file type but the functionality of the puzzle is all there and if you are midst-puzzle and want to start with a new image, clicking "choose file" will start a new puzzle. 

NOTE: Images which are larger than 400 by 400 pixels will be cropped to the top left corner for the puzzle. 

Tested in Firefox, Chrome, and Safari.

Created by Nadya Primak */




// the image being turned into the puzzle
var img;

// keeping count of how many pieces are in the right place on the baord
var wincount=0;

// width and height of each piece
var puzzleWidth;
var puzzleHeight;


// a boolean 2D array to keep pieces from overlapping
var usedXY;


// an array to store game pieces
var puzzle;

//the object which stores data for each puzzle piece
var puzzlePiece;

//slots is a 2d array storing all possible locations of pieces
var slotsX = new Array(4);
var slotsY = new Array(4);


// obligatory canvas variables  
var canvas;
var context;




window.onload = initAll;


function initAll(){
    canvas = document.getElementById('stage1');
    context = canvas.getContext('2d');
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.fill();
    if(!context) {
        // No 2d context available, let the user know
        alert('Please upgrade your browser');
    } else {
        getFile();
        drawBoard();
    }
}

// retrieve the user uploaded file
function getFile(){
       img = document.querySelector('img'); //selects the query named img
       var file    = document.querySelector('input[type=file]').files[0]; //sames as here
       var reader  = new FileReader();

       reader.onloadend = function () {
           img.src = reader.result;
       }

       if (file) {
           reader.readAsDataURL(file); //reads the data as a URL
       } else {
           img.src = "";
       }
  }


// drawing the pieces from the uploaded image to the board (calling functions to divide and scramble the pieces)
function drawBoard() {
    img.onload = function() {
        canvas.width = 415;
        canvas.height = 415;
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'black';
        context.fill();
        puzzleWidth = this.width/4;
        puzzleHeight = this.height/4;
        createPieces();
        setupSlots();
        usedXY = create2DArray(4);
        var puzzleOrder = create2DArray(4);
        var solveable;
        // shuffle pieces, keep shuffling until order is solveable
        do{
            for(var i=0; i< puzzle.length; i++){ 
                shufflePieces(i,puzzleOrder);
            }
            solveable = isSolveable(puzzleOrder);
            usedXY = create2DArray(4);
        }
        while(!solveable);
        //draw pieces to the board
        for(var i=0; i< puzzle.length; i++){ 
                context.drawImage(img, puzzle[i].sx, puzzle[i].sy, puzzle[i].sWidth, puzzle[i].sHeight, puzzle[i].x, puzzle[i].y, puzzle[i].width, puzzle[i].height);
        }

        
        canvas.addEventListener("mousedown", getPosition, false);

                       
    }
}

//making a 2D array
function create2DArray(length){
    var arr = new Array(length);
    for(var j = 0; j<arr.length; j++){
            arr[j] = new Array(4);
    }
    return arr;
}


// shuffle the puzzle pieces (updating the x and y coordinates)
//making sure that no pieces overlap each other
function shufflePieces(i,puzzleOrder){  
    usedXY[3][3] = true; // leaves the bottom right corner blank
   do{
       var x = Math.floor((Math.random() * 4)); 
       var y = Math.floor((Math.random() * 4)); 


   }
   while(usedXY[x][y]);
    usedXY[x][y] = true; 
    puzzleOrder[x][y] = puzzle[i].num;
    puzzle[i].x = slotsX[x];  
    puzzle[i].y = slotsY[y];
    
    
}

// check to make sure the shuffled version of the puzzle pieces is solveable
function isSolveable(puzzleOrder){
    var inversions = 0;
    var plainOrder = new Array(15);
    var count = 0;
    for(var y =0; y < 4; y++){
        for(var x=0; x< 4; x++){
            if(x==3 && y==3){
                break;
            }
            plainOrder[count] = puzzleOrder[x][y];
            count++;
            
        }
    } 
    for(var i =0; i<plainOrder.length; i++){
        for(var j= i+1; j<plainOrder.length; j++){
            if(plainOrder[j]>plainOrder[i]){
                inversions++;
            }
        }
    }
    if(inversions%2==1){
       return true;
    }
    else{
        return false;
    }
}
    
    

// create 2 arrays with exact pixel locations of X and Y coordinates of board
function setupSlots(){
    for(var i =0; i < 4; i++){
        slotsX[i] = i * puzzleWidth + (i*5);
        slotsY[i] = i * puzzleHeight + (i*5);
    
    }
   
}
  
// figure out where the user clicked on the canvas
function getPosition(event){
    var x = new Number();
    var y = new Number();
    
    if (event.x != undefined && event.y != undefined){
        x = event.x;
        y = event.y;
    }
    else{ // Firefox method to get the position
        x = event.clientX + document.body.scrollLeft +
              document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop +
              document.documentElement.scrollTop;
    }
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    selectPiece(x,y);
}


//checking if the user clicked on a piece
function selectPiece(clickX, clickY){
     for(var i=0; i< puzzle.length; i++){ 
            if(clickX > puzzle[i].x && clickX < puzzle[i].x + puzzle[i].sWidth){
                if(clickY > puzzle[i].y  && clickY < puzzle[i].y + puzzle[i].sHeight){
                    getNeighbors(i);
                }
            }
            
     }
    
}

// calling functions to figure out if there is a blank spot on any side of selected piece
// if so, move the selected piece to the blank spot
function getNeighbors(i){
    var neighborTop = getTop(i);
    var neighborBottom = getBottom(i);
    var neighborLeft = getLeft(i);
    var neighborRight = getRight(i);
    if(!neighborTop){
        context.fillRect(puzzle[i].x, puzzle[i].y, puzzleWidth, puzzleHeight);
        puzzle[i].y = puzzle[i].y - puzzleHeight - 5;
        context.drawImage(img, puzzle[i].sx, puzzle[i].sy, puzzle[i].sWidth, puzzle[i].sHeight, puzzle[i].x, puzzle[i].y, puzzle[i].width, puzzle[i].height);
    }
    if(!neighborBottom){
        context.fillRect(puzzle[i].x, puzzle[i].y, 100, 100);
        puzzle[i].y = puzzle[i].y + puzzleHeight + 5;
        context.drawImage(img, puzzle[i].sx, puzzle[i].sy, puzzle[i].sWidth, puzzle[i].sHeight, puzzle[i].x, puzzle[i].y, puzzle[i].width, puzzle[i].height);
    }
    if(!neighborLeft){
        context.fillRect(puzzle[i].x, puzzle[i].y, puzzleWidth, puzzleHeight);
        puzzle[i].x = puzzle[i].x - puzzleHeight - 5; 
        context.drawImage(img, puzzle[i].sx, puzzle[i].sy, puzzle[i].sWidth, puzzle[i].sHeight, puzzle[i].x, puzzle[i].y, puzzle[i].width, puzzle[i].height);
    }
    if(!neighborRight){
        context.fillRect(puzzle[i].x, puzzle[i].y, puzzleWidth, puzzleHeight);
        puzzle[i].x = puzzle[i].x + puzzleHeight + 5;
        context.drawImage(img, puzzle[i].sx, puzzle[i].sy, puzzle[i].sWidth, puzzle[i].sHeight, puzzle[i].x, puzzle[i].y, puzzle[i].width, puzzle[i].height);
    }
    checkWinner();
    
}

// check if there is a blank spot above the selected piece (if blank, return false: no neighbor)
function getTop(i){
    if(puzzle[i].y == slotsY[0]){
        return true;
    }
    else{
        //loop through all the puzzle pieces, check if the piece above exists
        for(var count=0; count < puzzle.length; count++){
            if(puzzle[count].y == puzzle[i].y - puzzleHeight - 5 && puzzle[count].x == puzzle[i].x){
                return true;
            }
        }
        return false;
        
    }
    
}

// check if there is a blank spot below the selected piece (if blank, return false: no neighbor)
function getBottom(i){
    if(puzzle[i].y == slotsY[3]){
        return true;
    }
    else{
        //loop through all the puzzle pieces, check if the piece below exists
        for(var count=0; count < puzzle.length; count++){
            if(puzzle[count].y == puzzle[i].y + puzzleHeight + 5 && puzzle[count].x == puzzle[i].x){
                return true;
            }
        }
        return false;

        
    }
    
}

// check if there is a blank spot to the right of the selected piece (if blank, return false: no neighbor)
function getRight(i){
    if(puzzle[i].x == slotsX[3]){
        return true;
    }
    else{
        //loop through all the puzzle pieces, check if the piece to the right exists
        for(var count=0; count < puzzle.length; count++){
            if(puzzle[count].x == puzzle[i].x + puzzleHeight + 5 && puzzle[count].y == puzzle[i].y){
                return true;
            }
        }
        return false;

        
    }
    
}

// check if there is a blank spot to the left of the selected piece (if blank, return false: no neighbor)
function getLeft(i){
    if(puzzle[i].x == slotsX[0]){
        return true;
    }
    else{
        //loop through all the puzzle pieces, check if the piece to the left exists
        for(var count=0; count < puzzle.length; count++){
            if(puzzle[count].x == puzzle[i].x - puzzleHeight - 5 && puzzle[count].y == puzzle[i].y){
                return true;
            }
        }
        return false;
        
    }
    
}

// check to see if current location of piece matches 
function checkWinner(){
    paddingY = 0;
    paddingX = 0;
    for(var i=0; i < puzzle.length; i++){
        if(i>= 0 && i <=3){
            paddingY = 0;
        }
        if(i>= 4 && i <=7){
            paddingY = 5;
        }
        if(i>= 8 && i <=11){
            paddingY = 10;
        }
        if(i>= 12 && i <=14){
            paddingY = 15;
        }
        if(i== 0 || i ==4 || i==8 || i== 12){
            paddingX= 0;
        }
        if(i== 1 || i ==5 || i==9 || i== 13){
            paddingX= 5;
        }
        if(i== 2 || i ==6 || i==10 || i== 14){
            paddingX= 10;
        }
        if(i== 3 || i ==7 || i==11){
            paddingX= 15;
        }
       
        if(puzzle[i].x == puzzle[i].sx+paddingX && puzzle[i].y == puzzle[i].sy+paddingY){
            wincount++;
        } 
        
    }
    if(wincount== puzzle.length){
        window.setTimeout(finalBoard, 500);
        window.setTimeout(addPiece, 1000);
    }
    else{
        wincount=0;
    }
}

// redraw the board without lines between the pieces
function finalBoard(){
    canvas.width =400;
    canvas.height = 400;
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.fill();
    for(var i=0; i < puzzle.length; i++){
        context.drawImage(img, puzzle[i].sx, puzzle[i].sy, puzzle[i].sWidth, puzzle[i].sHeight, puzzle[i].sx, puzzle[i].sy, puzzle[i].width, puzzle[i].height);
    }
}


// fade in the final piece of the board and add congratulatory text
function addPiece(){
    var ga = 0.0;
    var mytimer = setInterval(function(){
        context.globalAlpha = ga;
        context.drawImage(img, 3*puzzleWidth, 3*puzzleWidth, puzzleWidth, puzzleHeight, 3*puzzleWidth, 3*puzzleHeight, puzzleWidth, puzzleHeight);
        ga = ga + 0.1;
        
    }, 100);
    window.setTimeout(function(){
        clearInterval(mytimer);
    }, 4000);
    context.shadowColor = "black";
    context.shadowOffsetX = 3; 
    context.shadowOffsetY = 3; 
    context.shadowBlur = 2;
     context.font="30px Arial";
    // Create gradient
    var gradient = context.createLinearGradient(0,140,0,300);
    gradient.addColorStop("0","yellow");
    gradient.addColorStop("1","green");
    // Fill with gradient
    context.fillStyle=gradient;
    context.fillText("You solved the puzzle!",50,200);
    canvas.removeEventListener("mousedown", getPosition);

    
    
}


// create an object for each puzzle piece, store in an array
function createPieces() {
    var count=0;
    puzzle = new Array(15);
    for(var y =0; y < 4; y++){
        for(var x=0; x< 4; x++){
            if(x==3 && y==3){
                break; // leave last piece undefined (for blank square)
            }
            puzzlePiece = {
                sx: x*puzzleWidth,
                sy: y*puzzleWidth,
                sWidth: puzzleWidth,
                sHeight: puzzleHeight,
                x: 0,
                y: 0,
                width: puzzleWidth,
                height: puzzleHeight,
                num: count,
            };
            puzzle[count] = Object.create(puzzlePiece);
            count++;
        }
    }

}







