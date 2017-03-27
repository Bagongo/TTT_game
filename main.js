window.onload = function(){

	var gameBoard = [["E", "E", "E"], ["E", "E", "E"], ["E", "E", "E"]];
	var state = "continue";
	var settings = {multiplayer: null, player1:null, player2:null};
	var turn = null;
	var startPlayer1 = true;

	var display = document.getElementById("display");
	var boardRef = document.getElementById("board");
	var slots = document.getElementsByClassName("slot");
	for(var i=0; i < slots.length; i++)
	{
		slots[i].addEventListener("click", slotClicked);
		slots[i].firstElementChild.addEventListener("transitionend", function(){this.classList.remove("flip");});
	}

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

	function slotClicked()
	{
		var posX = this.dataset.posx;
		var posY = this.dataset.posy;

		if(gameBoard[posY][posX] !== "E" || state !== "continue")
			return;

		makeMove(turn, {x:posX, y:posY});
		turnManager(!settings.multiplayer);
	}

	function makeMove(player, pos)
	{
		for(var i=0; i < slots.length; i++)
		{
			if(slots[i].dataset.posx == pos.x && slots[i].dataset.posy == pos.y)
				slots[i].firstElementChild.innerHTML = player;
		}	

		gameBoard[pos.y][pos.x] = player;
	}

	function turnManager(moveAI)
	{
		evaluateState(gameBoard);

		if(state === "begin")
		{
			turn = startPlayer1 === true ? settings.player1 : settings.player2;
			display.innerHTML = turn + " to move";
			state = "continue";	
		}
		else if(state === "continue")
		{
			turn = turn === settings.player1 ? settings.player2 : settings.player1;
			display.innerHTML = turn + " to move";

			if(moveAI)
				AIMove();
		}
		else
			resolveGame();
	}

	function evaluateState(board)
	{
		if(!emptySlotsLeft(board))
			state = "draw!";
		
		if (winningPositions(board).length > 0)
			state = turn + " wins!";
	}

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

	function winningPositions(board) //detects winning state and returns positions of the winning chain
	{
		winPositions = []; //holds positions of the slots forming the winning chain

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

	function resolveGame()
	{
		var winPositions = winningPositions(gameBoard);

		for(var i=0; i < winPositions.length; i++)
		{
			for(var j=0; j < winPositions[i].length; j++)
				flipCell(winPositions[i][j]);	
		}

		display.innerHTML = state;

		if(settings.multiplayer)
			startPlayer1 = !startPlayer1;
	}

	function flipCell(pos)
	{
		for(var i=0; i < slots.length; i++)
		{
			if(slots[i].dataset.posx == pos[1] && slots[i].dataset.posy == pos[0])
				slots[i].firstElementChild.classList.add("flip");
		}
	}

	function resetGame()
	{
		resetBoard(gameBoard);
		state = "begin";
		turnManager(false);
	}

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

	function AIMove()
	{
		var board = gameBoard.map(function(arr) {
		     return arr.slice();
		});

		var move = findBestMove(board);
		makeMove(settings.player2, move);
		turnManager(false);
	}

	// This is the minimax function. It considers all
	// the possible ways the game can go and returns
	// the value of the board
	function minimax(board, depth, isMax)
	{
		var best;	 
	    // If Maximizer has won the game return his/her
	    // evaluated score
	    if (winningPositions(board).length > 0 && isMax)
	        return -10;
	 
	    // If Minimizer has won the game return his/her
	    // evaluated score
	    if (winningPositions(board).length > 0 && !isMax)
	        return 10;
	 
	    // If there are no more moves and no winner then
	    // it is a tie
	    if (!emptySlotsLeft(board))
	        return 0;
	 
	    // If this maximizer's move
	    if (isMax)
	    {
	        best = -1000;
	 
	        // Traverse all cells
	        for (var i=0; i < board.length; i++)
	        {
	            for (var j=0; j < board[i].length; j++)
	            {
	                // Check if cell is empty
	                if (board[i][j] === 'E')
	                {
	                    // Make the move
	                    board[i][j] = settings.player2;

	                    // Call minimax recursively and choose
	                    // the maximum value
	                    best = Math.max(best, minimax(board, depth+1, !isMax));
	 
	                    // Undo the move
	                    board[i][j] = 'E';
	                }
	            }
	        }
	        return best;
	    }
	 
	    // If this minimizer's move
	    else
	    {
	        best = 1000;
	 
	        // Traverse all cells
	        for (var y=0; y < board.length; y++)
	        {
	            for (var x=0; x < board[y].length; x++)
	            {
	                // Check if cell is empty
	                if (board[y][x] === 'E')
	                {
	                    // Make the move
	                    board[y][x] = settings.player1;
	 
	                    // Call minimax recursively and choose
	                    // the minimum value
	                    best = Math.min(best, minimax(board, depth+1, !isMax));
	 
	                    // Undo the move
	                    board[y][x] = 'E';
	                }
	            }
	        }
	        return best;
	    }
	}

	// This will return the best possible move for the player
	function findBestMove(board)
	{		
	    var bestVal = -1000;
	    var bestMove = {};
	 
	    // Traverse all cells, evalutae minimax function for
	    // all empty cells. And return the cell with optimal
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
	 
	                // compute evaluation function for this
	                // move.
	                var moveVal = minimax(board, 0, false);
	 
	                // Undo the move
	                board[i][j] = 'E';
	 
	                // If the value of the current move is
	                // more than the best value, then update
	                // best/
	                if (moveVal > bestVal)
	                {
	                    bestMove.x = j;
	                    bestMove.y = i;
	                    bestVal = moveVal;
	                }
	            }
	        }
	    }

	    return bestMove;
	}

	function bootGame()
	{
		printToDisplay("Wanna play a game?", function(){showButtons([0, 1]);});
	}

	function startSetup()
	{
		hideAllButtons();
		boardRef.style.display = "none";
		buttonBoxes[0].classList.remove("no-display");
		printToDisplay("Choose your opponent", function(){showButtons([2, 3]);});
	}

	function selectGameMode(value)
	{
		hideAllButtons(); 
		settings.multiplayer = this.innerHTML === "Human";
		printToDisplay("Choose your symbol", function(){showButtons([4, 5]);});
	}

	function selectSeed()
	{
		hideAllButtons();
		buttonBoxes[0].classList.add("no-display");
		settings.player1 = this.innerHTML;
		settings.player2 = settings.player1 === "X" ? "O" : "X";
		startPlayer1 = true;
		boardRef.style.display = "flex";
		buttonBoxes[1].classList.remove("no-display");		
		showButtons([6, 7]);
		resetGame();
	}

	function showQuote()
	{
		hideAllButtons(); 
		printToDisplay("A strange game. The only winning move is not to play...", function(){
			setTimeout(bootGame, 1500);
		});
	}

	function showButtons(idxs)
	{
		buttons[idxs[0]].classList.remove("no-display");
		buttons[idxs[1]].classList.remove("no-display");
	}

	function hideAllButtons()
	{
		for(var j=0; j < buttons.length; j++)
			buttons[j].classList.add("no-display");
	}

	function printToDisplay(string, callback)
	{
		display.innerHTML = "";

		for(i=0; i < string.length; i++)
			doScaledTimeout(i);

		function doScaledTimeout(idx) 
		{
			setTimeout(function(){
				display.innerHTML += string[idx];

				if(idx >= string.length - 1)
					setTimeout(callback, 500);
			}, idx * 100);
		}
	}

	bootGame();

};