(function() {
	
	var canvas = document.getElementById('game');
	var ctx = canvas.getContext('2d');
	var raf, game, finished = false, nMax = 100, 
		numOfCells = 30; // Sets difficulty where 30 spots will already be filled

	function main() {
		game = new Sudoku();
		game.init();
		game.generateGrid(numOfCells);
		draw();
	}

	function Cell(val, color) {
		this.val = val;
		this.color = color;
	}

	function Sudoku() {
		this.row = 9;
		this.col = 9;
		this.grid = [];
	}
	
	Sudoku.prototype.init = function () {
		var color = false;
		var colorTracker = 1;
	  	for (var i = 0; i < this.row; i++) {
			this.grid[i] = [];
			colorTracker = 1;
			color = false;
			if(i  == 3 || i == 4 || i == 5)
				color = true;
	    	for (var j = 0; j < this.col; j++) {
	    		if(colorTracker == 4){
	    			color = !color;
	    			colorTracker = 1;
	    		}
	    		// TODO Keep it -1 as default
	    		var newCell = new Cell(-1, color);
	    		this.grid[i].push(newCell);
	    		colorTracker++;
	    	}
	  	}      		  		
	}

	Sudoku.prototype.generateGrid = function (numCells) {
		var min = 1, max = 9;
		var count = 0, removed = 0;
		//Assign Random 9 numbers in 1st block
		for(var i=0; i<3; i++){
			for(var j=0; j<3; j++){
				while(this.grid[i][j].val < 0){
					var randomNum = Math.floor(Math.random() * (max - min + 1) + min);
					this.grid[i][j].val = randomNum;
					if(this.isPresentInBlock(i, j) ||
						this.isPresentInRows(i, j) ||
						this.isPresentInCols(i, j)){
						this.grid[i][j].val = -1;
					}
				}
			}
		}
		// Solvw the sudoku
		this.solve([], 0, 9);

		// Remove a bunch of grids as per difficulty
		while(this.row*this.col - removed != numCells) {
			var randomRow = Math.floor(Math.random() * (max - min + 1));
			var randomCol = Math.floor(Math.random() * (max - min + 1));
			if(this.grid[randomRow][randomCol].val > 0){
				this.grid[randomRow][randomCol].val = -1;
				removed++;
			}
		}
	}
	Sudoku.prototype.isPresentInCols = function(m, n) {
	  	for (var i = 0; i < this.col; i++) {
	    	if(n != i && this.grid[m][i].val == this.grid[m][n].val){
	    		return true;
	    	}
	  	}
	  	return false;
	}
	Sudoku.prototype.isPresentInRows = function(m, n) {
	  	for (var i = 0; i < this.row; i++) {
	    	if(m != i && this.grid[i][n].val == this.grid[m][n].val){
	    		return true;
	    	}
	  	}
	  	return false;
	}
	Sudoku.prototype.isPresentInBlock = function(m, n) {
	  	var startRow = m - m%3;
	  	var startCol = n - n%3;
	  	for (var i = startRow; i < startRow+3; i++) {
	    	for (var j = startCol; j < startCol+3; j++) {
	    		if(i != m && j != n && this.grid[i][j].val == this.grid[m][n].val) {
	    			return true;
	    		}
	    	}
	    }

	  	return false;
	}

	Sudoku.prototype.solve = function (arr, k, solved) {
		var nCandidates = [];
		var nCand, i, xy = [3,0];
		if(this.isSolution(k, solved)) {
			finished = true;
		}
		else{
			k++;
			nCand = this.computeCandidate(arr, k, nCandidates, xy);
			for(i=0; i<nCand; i++){
				arr[k] = nCandidates[i];
				this.grid[xy[0]][xy[1]].val = arr[k];
				this.solve(arr, k, solved);
				if(finished) return;
				this.grid[xy[0]][xy[1]].val = -1;
			}
		}


	}
	Sudoku.prototype.isSolution = function(k, solved) {
		return k === this.row*this.col - solved;
	}
	Sudoku.prototype.computeCandidate = function(arr, k, nCandidates, xy) {
		var nCand = 0,
			possibleVal = [];
		for(var i=0; i<10; i++){
			possibleVal.push(true);
		}
		xy = this.gridXandY(xy);
		for(var i=0; i<this.row; i++){
			if(this.grid[xy[0]][i].val > 0){
				possibleVal[this.grid[xy[0]][i].val] = false;
			}
		}
		for(var i=0; i<this.col; i++){
			if(this.grid[i][xy[1]].val > 0){
				possibleVal[this.grid[i][xy[1]].val] = false;
			}
		}
		var boxX = xy[0] - xy[0]%3;
		var boxY = xy[1] - xy[1]%3;

		for(var i=0; i<3; i++){
			for(var j=0; j<3; j++){
				if(this.grid[boxX+i][boxY+j].val > 0){
					possibleVal[this.grid[boxX+i][boxY+j].val] = false;
				}
			}
		}

		for(var i=1; i<=this.row; i++){
			if(possibleVal[i]){
				nCandidates[nCand] = i;
				nCand++;
			}
		}

		return nCand;

	}

	Sudoku.prototype.gridXandY = function(xy) {
		for(var i=0; i<this.row; i++){
			for(var j=0; j<this.col; j++){
				if(this.grid[i][j].val < 0){
					xy[0] = i;
					xy[1] = j;
					return xy;
				}
			}
		}
	}
	Sudoku.prototype.isSolved = function() {
		for(var i=0; i<this.row; i++){
			for(var j=0; j<this.col; j++){
				if(this.grid[i][j].val < 0){
					return false;
				}
			}
		}
		return true;
	}

	var draw = function () {
		// TODO add drawing logic
		for (var i = 0; i < game.row; i++) {
	    	for (var j = 0; j < game.col; j++) {
	    		if(game.grid[i][j].color){
	    			ctx.fillStyle = 'grey';
	      			ctx.fillRect(j * 50, i * 50, 50, 50);
	    		}
	    		ctx.fillStyle = '#FFFFFF';
	      		ctx.strokeRect(j * 50, i * 50, 50, 50);

	      		ctx.fillStyle = '#000';
	      		ctx.font = "30px helvetica";
	      		ctx.fillText(game.grid[i][j].val > 0 && game.grid[i][j].val < 10 ? game.grid[i][j].val : '', j * 50+15, i * 50+ 35);
	    	}
	    }

		raf = window.requestAnimationFrame(draw);
	}

	canvas.addEventListener('click', function(){
		//TODO solve algorithm
		if(!game.isSolved()){
			finished = false;
			game.solve([], 0, numOfCells);
			raf = window.requestAnimationFrame(draw);
		}
	});

	//Main function
	main();

}());