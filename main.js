window.onload = function(){

//////////////////////////////////////////GLOBAL VARS AND LISTENERS///////////////////////////////////////////////////////////////////	

	var gameBoard = [["E", "E", "E"], ["E", "E", "E"], ["E", "E", "E"]]; //representation of the game board, holds players' moves
	var state = "begin"; //the current state of the game
	var settings = {multiplayer: null, player1:null, player2:null}; //settings modifiable by user
	var turn = null; //holds the seed of the player whose current turn is 
	var startPlayer1 = true; //determines if player1 (or 2) will move first 

	var display = document.getElementById("display");
	var boardRef = document.getElementById("board");
	var slots = document.getElementsByClassName("slot"); //the board cells
	for(var i=0; i < slots.length; i++)
	{
		slots[i].addEventListener("click", slotClicked);
		slots[i].firstElementChild.addEventListener("transitionend", function(){
			this.classList.remove("flip");
		});
	}

	//all of the game's buttons
	var buttonBoxes = document.getElementsByClassName("button-box");
	var buttons = document.getElementsByClassName("btn");
	buttons[0].addEventListener("click", startSetup);
	buttons[1].addEventListener("click", showQuote);
	buttons[2].addEventListener("click", selectGameMode);
	buttons[3].addEventListener("click", selectGameMode);
	buttons[4].addEventListener("click", selectSeed);
	buttons[5].addEventListener("click", selectSeed);
	buttons[6].addEventListener("click", startSetup);
	buttons[7].addEventListener("click", resetGame);

//////////////////////////////////////GAME INNER FUNCTIONING///////////////////////////////////////////////////

	function slotClicked() 
	{
		//collecting the coordinates of the cell clicked
		var posX = this.dataset.posx;
		var posY = this.dataset.posy;

		//return if clicked cell's not empty or game's over 
		if(gameBoard[posY][posX] !== "E" || state !== "continue")
			return;

		makeMove(turn, {x:posX, y:posY});
		turnManager(!settings.multiplayer);
	}

	function makeMove(player, pos) //actualize the move made
	{
		//finds the corresponding slot in the actual board and fills it
		for(var i=0; i < slots.length; i++)
		{
			if(slots[i].dataset.posx == pos.x && slots[i].dataset.posy == pos.y)
				slots[i].firstElementChild.innerHTML = player;
		}
			
		//fills the slot in the board array
		gameBoard[pos.y][pos.x] = player;
	}

	function turnManager(moveAI)
	{
		evaluateState(gameBoard);

		if(state === "begin")
		{
			//determines who's to start the game
			turn = startPlayer1 === true ? settings.player1 : settings.player2;
			//prints whose current turn is
			display.innerHTML = turn + " to move"; 
			state = "continue";	
		}
		else if(state === "continue")
		{
			//toggle current player for next turn
			turn = turn === settings.player1 ? settings.player2 : settings.player1;
			display.innerHTML = turn + " to move";

			if(moveAI)
				AIMove();
		}
		else
			resolveGame();
	}

	//checking if final state was reached
	function evaluateState(board)
	{
		if(!emptySlotsLeft(board))
			state = "draw!";
		
		if (winningPositions(board).length > 0)
			state = turn + " wins!";
	}

	//detects if there are empty slots left
	function emptySlotsLeft(board)
	{
		for(var i=0; i < board.length; i++)
		{
			for(var j=0; j < board[i].length; j++)
			{
				if(board[i][j] === "E")
					return true;
			}
		}

		return false;
	}

	//detects winning state and returns positions of the winning chain
	function winningPositions(board)
	{
		winPositions = []; //holds positions of the slots forming the winning chain(s)

		for(var i=0; i < board.length; i++) //check rows
		{
			if(board[i][0] !== "E" && board[i][0] === board[i][1] && board[i][1] === board[i][2])
				winPositions.push([[i,0], [i,1], [i,2]]); 
		}

		for(var j=0; j < board[0].length; j++) //check columns
		{
			if(board[0][j] !== "E" && board[0][j] === board[1][j] && board[1][j] === board[2][j])
				winPositions.push([[0,j], [1,j], [2,j]]); 
		}

		for(var x=0; x <= 2; x += 2) //check diagonals
		{
			if(board[1][1] !== "E" && board[0][0+x] === board[1][1] && board[1][1] === board[2][2-x])
				winPositions.push([[0,0+x], [1,1], [2,2-x]]); 
		}

		return winPositions;
	}

	//perform actions when game is over
	function resolveGame()
	{
		var winPositions = winningPositions(gameBoard);

		//search actual board for cells making up the winning chain
		for(var i=0; i < winPositions.length; i++)
		{
			for(var j=0; j < winPositions[i].length; j++)
				flipCell(winPositions[i][j]);	
		}

		//declares the winner
		display.innerHTML = state;

		//switches starting player for next game (multiplayer only)
		if(settings.multiplayer)
			startPlayer1 = !startPlayer1;
	}

	//triggers flip animation on cell
	function flipCell(pos)
	{
		for(var i=0; i < slots.length; i++)
		{
			if(slots[i].dataset.posx == pos[1] && slots[i].dataset.posy == pos[0])
				slots[i].firstElementChild.classList.add("flip");
		}
	}

	//reset the state and boards for a new game
	function resetGame()
	{
		resetBoard(gameBoard);
		state = "begin";
		turnManager(false);
	}

    //empties both virtual and actual board
	function resetBoard(board)
	{
		for(var i=0; i < board.length; i++)
		{
			for(var j=0; j < board[i].length; j++)
				board[i][j] = "E";
		}

		for(var x=0; x < slots.length; x++)
			slots[x].firstElementChild.innerHTML = "";
	}

	//AI's turn set of actions
	function AIMove()
	{
		//makes a copy of the current game board
		//for AI's ahead reasoning
		var board = gameBoard.map(function(arr) {
		     return arr.slice();
		});

		var move = findBestMove(board);
		makeMove(settings.player2, move);
		turnManager(false);
	}

///////////////////////////////////////AI SYSTEM/////////////////////////////////////////////////	

	// Minimax - considers all the possible ways
	// the game can go and returns a value
	// for each playing path
	function minimax(board, depth, isMax)
	{
		var best;

	    // if maximizer has won the game return neg value
	    if (winningPositions(board).length > 0 && isMax)
	        return -10;
	 
	    // if minimizer has won the game return pos value 
	    if (winningPositions(board).length > 0 && !isMax)
	        return 10;
	 
	    //if tie returns 0
	    if (!emptySlotsLeft(board))
	        return 0;
	 
	    // If this is maximizer's move
	    if (isMax)
	    {
	        best = -1000;
	 
	        for (var i=0; i < board.length; i++)
	        {
	            for (var j=0; j < board[i].length; j++)
	            {
	                if (board[i][j] === 'E')
	                {
	                    // Make the hypothetical move
	                    board[i][j] = settings.player2;

	                    // Call minimax recursively and choose
	                    // and store the current best value
	                    best = Math.max(best, minimax(board, depth+1, !isMax));
	 
	                    // Undo the move
	                    // to clean the space for further recursions 
	                    board[i][j] = 'E';
	                }
	            }
	        }

	        return best;
	    }
	 
	    // If this is minimizer's move - works as maximizer but
	    // with opposite parameters
	    else
	    {
	        best = 1000;
	 
	        for (var y=0; y < board.length; y++)
	        {
	            for (var x=0; x < board[y].length; x++)
	            {
	                if (board[y][x] === 'E')
	                {
	                    board[y][x] = settings.player1;
	                    best = Math.min(best, minimax(board, depth+1, !isMax));
 	                    board[y][x] = 'E';
	                }
	            }
	        }

	        return best;
	    }
	}

	// returns the best possible move for ai
	function findBestMove(board)
	{		
	    var bestVal = -1000;
	    var bestMove = {};
	 
	    // Traverses all cells, evaluates minimax function for
	    // all empty cells. Then returns the cell with optimal
	    // value.
	    for (var i=0; i < board.length; i++)
	    {
	        for (var j=0; j < board[i].length; j++)
	        {
	            // Check if celll is empty
	            if (board[i][j] === 'E')
	            {
	                // Make the move
	                board[i][j] = settings.player2;
	 
	                // calculates the value for this move
	                var moveVal = minimax(board, 0, false);
	 
	                // Undo the move
	                board[i][j] = 'E';
	 
					//updates bestVal to the best value found so far
	                if (moveVal > bestVal)
	                {
	                	//stores coordinates of the current best move
	                    bestMove.x = j;
	                    bestMove.y = i;
	                    bestVal = moveVal;
	                }
	            }
	        }
	    }

	    return bestMove;
	}

////////////////////////////////////GAME INTRO AND SETUP////////////////////////////////////////

	//first step of the intro
	function bootGame()
	{
		printToDisplay("Would you like to play a game?", function(){showButtons([0, 1]);});
	}

	//shows reference 
	function showQuote()
	{
		hideAllButtons(); 
		printToDisplay("A strange game. The only winning move is not to play...", function(){
			setTimeout(bootGame, 1500);
		});
	}

	//diplays 'choose vs' buttons 
	function startSetup()
	{
		hideAllButtons();
		boardRef.style.display = "none";
		buttonBoxes[0].classList.remove("no-display");
		printToDisplay("Choose your opponent", function(){showButtons([2, 3]);});
	}

	//detects and stores user opponent choice 
	function selectGameMode(value)
	{
		hideAllButtons(); 
		settings.multiplayer = this.innerHTML === "Human";
		printToDisplay("Choose your symbol", function(){showButtons([4, 5]);});
	}

	//final step of set up - detects and stores user's seed choice and starts the game
	function selectSeed()
	{
		hideAllButtons();
		buttonBoxes[0].classList.add("no-display");
		settings.player1 = this.innerHTML;
		settings.player2 = settings.player1 === "X" ? "O" : "X";
		startPlayer1 = true;
		boardRef.style.display = "flex"; //reveals the actual board
		buttonBoxes[1].classList.remove("no-display");		
		showButtons([6, 7]); //reveals in-game buttons
		resetGame(); //starts the game
	}

	//makes the setup buttons passed as params visible 
	function showButtons(idxs)
	{
		buttons[idxs[0]].classList.remove("no-display");
		buttons[idxs[1]].classList.remove("no-display");
	}

	//make all buttons non visible
	function hideAllButtons()
	{
		for(var j=0; j < buttons.length; j++)
			buttons[j].classList.add("no-display");
	}

	//gradually prints message to display as if somebody is typing
	function printToDisplay(string, callback)
	{
		//empties the display
		display.innerHTML = "";

		//loops through each char of the message to be type out
		for(i=0; i < string.length; i++)
			doScaledTimeout(i);

		//prints out each char one after the other 
		//with brief delay in between
		function doScaledTimeout(idx) 
		{
			setTimeout(function(){
				display.innerHTML += string[idx];

				//calls the function passed once the full
				//message has been printed out
				if(idx >= string.length - 1)
					setTimeout(callback, 500);
			}, idx * 100);
		}
	}

	bootGame();

};