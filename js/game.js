'use strict';

// constants
var EMPTY = '';
var MINE = '💣';
var FLAG = '🚩';

// global variables
var gBoard;
var gLevel = {
	size: 4,
	mines: 2,
};
var gGame = {
	isOn: false,
	shownCount: 0,
	markedCount: 0,
	flagsCount: 0,
	interval: 0,
	startTime: 0,
	livesCount: 3,
	hintsCount: 3,
};

function initGame(size = gLevel.size, mineCount = gLevel.mines) {
	clearInterval(gGame.interval);
	gGame.interval = 0;
	gGame.startTime = new Date();
	renderTimer();

	gGame.livesCount = 3;
	// renderLives();

	gGame.hintsCount = 3;
	// renderHints();

	gBoard = buildEmptyBoard(size);

	gLevel.size = size;
	gLevel.mines = mineCount;

	gGame.flagsCount = 0;
	renderFlagsCount();

	gGame.shownCount = 0;
	gGame.markedCount = 0;

	gHints.hintTimeout = 0;
	gHints.hintOrigCells = [];
	gHints.isHintsClicked = false;

	// buildBoard(gBoard);
	renderBoard(gBoard);
	renderSmiley(STANDARD_SMILEY);
	renderHighScores();
}

// builds cells for an empty board, pos is the position of the first click
function buildBoard(board, pos) {
	// first put the mines on the board
	var minesPos = getRandomMinePositions(board, gLevel.mines, pos);

	for (var i = 0; i < minesPos.length; i++) {
		board[minesPos[i].i][minesPos[i].j] = {
			mineAroundCount: -1,
			isShown: false,
			isMine: true,
			isMarked: false,
			isChecked: true,
			isBlown: false,
		};
	}

	// now put all numbers where there are no mines
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			if (board[i][j] === EMPTY) {
				board[i][j] = {
					mineAroundCount: countNegMines(board, i, j),
					isShown: false,
					isMine: false,
					isMarked: false,
					isChecked: false,
				};
			}
		}
	}
}

// called when cell is left-clicked
function cellClicked(elCell) {
	// check if this is the first click of the game
	if (!gGame.interval) firstClick(elCell);
	// do nothing if game is not on
	if (!gGame.isOn) return;
	// if hint is shown, do nothing
	if (gHints.hintTimeout) return;

	var cell = gBoard[elCell.dataset.i][elCell.dataset.j];
	// ignore alerady shown cell
	if (cell.isShown) return;
	// do nothing if flag is clicked
	if (cell.isMarked) return;

	// if player clicked the hint before clicking on the board
	if (gHints.isHintsClicked) {
		revealNeighbours(elCell);
		gGame.hintsCount--;
		gHints.hintTimeout = setTimeout(hideNeighbours, 1000);
		return;
	}

	// if hidden cell is clicked, show it
	cell.isShown = true;
	cell.isChecked = true;

	// if we hit a mine
	if (cell.isMine) {
		gGame.livesCount--;

		// regard pressing a bomb with lives left the same as putting a flag on it
		gGame.flagsCount++;
		gGame.markedCount++;

		// we still win if the last click was a bomb and we had lives
		checkGameOver();

		// stop game if we lost all lives
		if (!gGame.livesCount) {
			cell.isBlown = true;
			gGame.isOn = false;
			clearInterval(gGame.interval);

			revealAllMines(gBoard);
			renderSmiley(LOSE_SMILEY);
		}
	} else {
		// if it was not a bomb
		gGame.shownCount++;

		// expand more squares if the clicked one is empty, shown count is handled inside
		if (cell.mineAroundCount === 0) {
			expandShown(gBoard, +elCell.dataset.i, +elCell.dataset.j);
			renderBoard(gBoard);
		}

		// check for win condition
		checkGameOver();
	}

	renderFlagsCount();
	renderBoard(gBoard);
}

function firstClick(elCell) {
	gGame.isOn = true;
	gGame.startTime = new Date();

	gGame.interval = setInterval(renderTimer, 1000);

	var pos = { i: elCell.dataset.i, j: elCell.dataset.j };
	buildBoard(gBoard, pos);
	renderBoard(gBoard);
}

// called when cell is right-clicked
function cellMarked(elCell) {
	// do nothing if game is not on
	if (!gGame.isOn) return;
	// if hint is pressed or shown, do nothing
	if (gHints.hintTimeout || gHints.isHintsClicked) return;

	var cell = gBoard[elCell.dataset.i][elCell.dataset.j];
	// do nothing if cell is already shown and it is not a flag
	if (cell.isShown && !cell.isMarked) return;

	// toggle the flag
	cell.isMarked = !cell.isMarked;
	cell.isShown = !cell.isShown;

	// if cell was a mine, add 1 to marked count
	// if correct flag is removed decrease the count
	if (cell.isMine) cell.isMarked ? gGame.markedCount++ : gGame.markedCount--;

	cell.isMarked ? gGame.flagsCount++ : gGame.flagsCount--;

	renderFlagsCount();

	// check for win condition
	checkGameOver();

	renderBoard(gBoard);
}

// show all numbers around
function expandShown(board, cellI, cellJ) {
	// don't check this cell in the future
	board[cellI][cellJ].isChecked = true;

	// loop all neighbours
	for (var i = cellI - 1; i <= cellI + 1; i++) {
		if (i < 0 || i >= board.length) continue;

		for (var j = cellJ - 1; j <= cellJ + 1; j++) {
			if (j < 0 || j >= board[0].length) continue;
			if (i === cellI && j === cellJ) continue;

			var cell = board[i][j];

			// no need to check a cell twice
			if (cell.isChecked) continue;

			// don't touch mines (flagged or not)
			if (cell.isMine) continue;

			// if all checks are passed
			cell.isShown = true;
			cell.isChecked = true;
			gGame.shownCount++;

			// override flags if there is a number (as in original game)
			if (cell.isMarked && cell.mineAroundCount > 0) cell.isMarked = false;

			// if neighbouring cell is also empty do the same for him
			if (cell.mineAroundCount === 0) expandShown(board, i, j);
		}
	}
}

// checks if the game is won
function checkGameOver() {
	// if we covered all mines with flags
	if (gGame.markedCount === gLevel.mines) {
		// count non mine cells
		var nonMineCells = gLevel.size ** 2 - gLevel.mines;
		// if all are shown, the game is won
		if (gGame.shownCount === nonMineCells) {
			// stop the game
			gGame.isOn = false;
			clearInterval(gGame.interval);
			renderSmiley(WIN_SMILEY);

			// check if we have a new high score
			var timeNow = new Date();
			var seconds = Math.floor((timeNow - gGame.startTime) / 1000);

			if (gLevel.size === 4) {
				var beginnerScore = localStorage.getItem('beginnerScore');
				if (!beginnerScore) beginnerScore = 999;
				if (seconds < beginnerScore) {
					localStorage.setItem('beginnerScore', seconds);
				}
			} else if (gLevel.size === 8) {
				var mediumScore = localStorage.getItem('mediumScore');
				if (!mediumScore) mediumScore = 999;
				if (seconds < mediumScore) {
					localStorage.setItem('mediumScore', seconds);
				}
			} else if (gLevel.size === 12) {
				var expertScore = localStorage.getItem('expertScore');
				if (!expertScore) expertScore = 999;
				if (seconds < expertScore) {
					localStorage.setItem('expertScore', seconds);
				}
			}

			renderHighScores();
		}
	}
}
