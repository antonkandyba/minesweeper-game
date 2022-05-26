'use strict';

var gManualMode = {
	isOn: false,
	mines: [],
	prevBombCount: 0,
};

var gBoom = {
	mines: [],
	prevBombCount: 0,
};

// stores every change in the board so we can undo moves
var gStates = {
	board: [],
	game: [],
};

function clickManualModeButton() {
	// works only if game hasn't started yet
	if (gGame.isOn) return;

	// if we click the button after adding the mines
	if (gManualMode.isOn) {
		// start game with mines as placed by player
		gManualMode.isOn = false;
		// cover the board;
		for (var i = 0; i < gBoard.length; i++) {
			gBoard[i].forEach((cell) => {
				cell.isShown = false;
			});
		}

		var elManualBtn = document.querySelector('#manual-mode-button');
		elManualBtn.style.visibility = 'hidden';

		renderBoard(gBoard);
		return;
	}

	gManualMode.isOn = true;

	// remember the level before we entered manual mode
	gManualMode.prevBombCount = gLevel.mines;
	gLevel.mines = 0;
	renderFlagsCount();

	var board = buildEmptyBoard(gLevel.size);

	// create an empty board with all cells shown
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			board[i][j] = createStandardCell();
			board[i][j].isShown = true;
			board[i][j].mineAroundCount = 0;
		}
	}
	// hide 7 boom button when entering manual mode
	var elBoomBtn = document.querySelector('#boom-button');
	elBoomBtn.style.visibility = 'hidden';

	var elManualBtn = document.querySelector('#manual-mode-button');
	elManualBtn.innerText = 'Begin!';

	gBoard = board;
	renderBoard(gBoard);
}

function manualCellClicked(elCell) {
	var cellI = +elCell.dataset.i;
	var cellJ = +elCell.dataset.j;

	gManualMode.mines.push({ i: cellI, j: cellJ });

	gLevel.mines++;
	renderFlagsCount();

	gBoard[cellI][cellJ].isMine = true;
	renderBoard(gBoard);
}

// creates the mines array according to the 7 boom rules
function clickBoomButton() {
	// hide 7 boom and manual mode buttons
	var elBoomBtn = document.querySelector('#boom-button');
	elBoomBtn.style.visibility = 'hidden';
	var elManualBtn = document.querySelector('#manual-mode-button');
	elManualBtn.style.visibility = 'hidden';

	gBoard = buildEmptyBoard(gLevel.size);

	// go lineary through all board indexes (count all from 0)
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[i].length; j++) {
			var num = i * gBoard[i].length + j + 1;
			// include the number if it is divisible by 7
			// or if the number contains the 7 digit in it
			if (num % 7 === 0 || ('' + num).includes('7')) {
				gBoom.mines.push({ i, j });
			}
		}
	}
	// remember original game bomb count
	gBoom.prevBombCount = gLevel.mines;

	gLevel.mines = gBoom.mines.length;
	renderFlagsCount();
	// 0,0 always exists and never has a mine according to the rules
	buildBoard(gBoard, { i: 0, j: 0 }, gBoom.mines);

	// start the game without the first click
	gGame.isOn = true;
	gGame.startTime = new Date();
	gGame.interval = setInterval(renderTimer, 1000);

	renderBoard(gBoard);
}

function clickUndoButton() {
	// do nothing if the game is not on
	if (!gGame.isOn) return;
	// do nothing if we have no saved states
	if (gStates.board.length === 0) return;

	gBoard = gStates.board.pop();
	gGame = gStates.game.pop();

	renderBoard(gBoard);
}

// returns a deep copy of a matrix
function deepCopyMatrix(mat) {
	var copy = [];

	for (var i = 0; i < mat.length; i++) {
		copy.push([]);
		for (var j = 0; j < mat[i].length; j++) {
			copy[i].push({ ...mat[i][j] });
		}
	}

	return copy;
}

// saves the board and the game state at the moment
function saveState() {
	gStates.board.push(deepCopyMatrix(gBoard));
	gStates.game.push({ ...gGame });
}
