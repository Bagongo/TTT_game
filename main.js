window.onload = function(){

	var board = [["E", "E", "E"], ["E", "E", "E"], ["E", "E", "E"]];
	var state = "continue";
	var currPlayer = "X";
	var totalMoves = 0;

	var display = document.getElementById("display");
	var slots = document.getElementsByClassName("slot");

	for(var i=0; i < slots.length; i++)
		slots[i].addEventListener("click", slotClicked);

	document.getElementById("new-game").addEventListener("click", resetState);

	function slotClicked()
	{
		if(board[this.dataset.posx][this.dataset.posy] !== "E" || state !== "continue")
			return;

		totalMoves++;
		board[this.dataset.posx][this.dataset.posy] = currPlayer;
		this.innerHTML = currPlayer;
		evaluateState();

		if(state !== "continue")
			resolveGame();
		else			
			currPlayer = currPlayer === "X" ? "O" : "X";
	}

	function evaluateState()
	{
		if(totalMoves >= 9)
			state = "draw";
		
		if (winningPositions().length > 0)
			state = currPlayer + " wins!";
	}

	function winningPositions()
	{
		winPositions = []; //holds the positions of the slots forming the winning chain

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

	function resetState()
	{
		state = "continue";
		totalMoves = 0;
		currPlayer = "X";
		display.innerHTML = "play!";
		resetBoard();
	}

	function resetBoard()
	{
		for(var i=0; i < board.length; i++)
		{
			for(var j=0; j < board[i].length; j++)
				board[i][j] = "E";
		}

		for(var x=0; x < slots.length; x++)
			slots[x].innerHTML = "";
	}

};