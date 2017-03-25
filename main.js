window.onload = function(){

	var gameBoard = [["E", "E", "E"], ["E", "E", "E"], ["E", "E", "E"]];
	var state = "continue";
	var currPlayer = "X";
	var multiPlayer = true;

	var display = document.getElementById("display");
	var slots = document.getElementsByClassName("slot");

	for(var i=0; i < slots.length; i++)
		slots[i].addEventListener("click", slotClicked);

	document.getElementById("new-game").addEventListener("click", resetGame);

	function slotClicked()
	{
		var posX = this.dataset.posx;
		var posY = this.dataset.posy;

		if(gameBoard[posY][posX] !== "E" || state !== "continue")
			return;

		makeMove(currPlayer, {x:posX, y:posY});
		turnManager(false);
	}

	function makeMove(player, pos)
	{
		for(var i=0; i <slots.length; i++)
		{
			if(slots[i].dataset.posx == pos.x && slots[i].dataset.posy == pos.y)
				slots[i].innerHTML = player;
		}	

		gameBoard[pos.y][pos.x] = player;
	}

	function turnManager(lastMoveWasAI)
	{
		evaluateState(gameBoard);

		if(state !== "continue")
			resolveGame(gameBoard);
		else
		{
			currPlayer = currPlayer === "X" ? "O" : "X";

			if(!multiPlayer && !lastMoveWasAI)
				AIMove();
		}			
	}

	function evaluateState(board)
	{
		if(!emptySlotsLeft(board))
			state = "draw";
		
		if (winningPositions(board).length > 0)
			state = currPlayer + " wins!";
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
				winPositions.push([[i,0], [i,1], [i,2]]); 
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
		display.innerHTML = state;
	}

	function resetGame()
	{
		state = "continue";
		currPlayer = "X";
		display.innerHTML = "play!";
		resetBoard(gameBoard);
	}

	function resetBoard(board)
	{
		for(var i=0; i < board.length; i++)
		{
			for(var j=0; j < board[i].length; j++)
				board[i][j] = "E";
		}

		for(var x=0; x < slots.length; x++)
			slots[x].innerHTML = "";
	}

	function AIMove()
	{
		var board = gameBoard.map(function(arr) {
		     return arr.slice();
		});

		var move = findBestMove("O", board);

		console.log(move);

		makeMove("O", move);
		turnManager(true);
	}


	var minimaxCounter = 0;
	// This is the minimax function. It considers all
	// the possible ways the game can go and returns
	// the value of the board
	function minimax(board, depth, isMax, seeds)
	{

		minimaxCounter++;
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
	                    board[i][j] = seeds.ai;

	                    // Call minimax recursively and choose
	                    // the maximum value
	                    best = Math.max(best, minimax(board, depth+1, !isMax, seeds));
	 
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
	                    board[y][x] = seeds.player;
	 
	                    // Call minimax recursively and choose
	                    // the minimum value
	                    best = Math.min(best, minimax(board, depth+1, !isMax, seeds));
	 
	                    // Undo the move
	                    board[y][x] = 'E';
	                }
	            }
	        }
	        return best;
	    }
	}

	// This will return the best possible move for the player
	function findBestMove(seed, board)
	{		
		var seeds = {ai:seed, 
					 player:(seed === "X") ? "0" : "X"};
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
	                board[i][j] = seeds.ai;
	 
	                // compute evaluation function for this
	                // move.
	                var moveVal = minimax(board, 0, false, seeds);

	                console.log(moveVal + " " + i + " " + j);
	 
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

	    console.log(minimaxCounter);
	    minimaxCounter = 0;
	 
	    return bestMove;
	}

};