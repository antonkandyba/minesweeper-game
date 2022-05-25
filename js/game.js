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
	timer: 0,
};

function initGame(size = gLevel.size, mineCount = gLevel.mines) {
	gBoard = buildEmptyBoard(size);

	gLevel.size = size;
	gLevel.mines = mineCount;

	gGame.shownCount = 0;
	gGame.markedCount = 0;

	buildBoard(gBoard);
	renderBoard(gBoard);
	renderSmiley(STANDARD_SMILEY);

	printTable(gBoard);

	gGame.isOn = true;
}

// builds cells for an empty board
function buildBoard(board) {
	// first put the mines on the board
	var minesPos = getRandomMinePositions(board, gLevel.mines);

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
	// do nothing if game is not on
	if (!gGame.isOn) return;

	var cell = gBoard[elCell.dataset.i][elCell.dataset.j];
	// ignore alerady shown cell
	if (cell.isShown) return;
	// do nothing if flag is clicked
	if (cell.isMarked) return;

	// if closed cell is clicked, show it
	cell.isShown = true;
	cell.isChecked = true;

	if (cell.isMine) {
		cell.isBlown = true;
		gGame.isOn = false;

		// change the smiley
		renderSmiley(LOSE_SMILEY);
	}

	// increase shown cells count for the opened cell
	gGame.shownCount++;
	// expand more squares if the clicked one is empty, shown count is handled inside
	if (cell.mineAroundCount === 0) {
		expandShown(gBoard, +elCell.dataset.i, +elCell.dataset.j);
		renderBoard(gBoard);
	}

	// check for win condition
	checkGameOver();

	renderBoard(gBoard);
}

// called when cell is right-clicked
function cellMarked(elCell) {
	// do nothing if game is not on
	if (!gGame.isOn) return;

	var cell = gBoard[elCell.dataset.i][elCell.dataset.j];
	// do nothing if cell is already shown and it is not a flag
	if (cell.isShown && !cell.isMarked) return;

	// toggle the flag
	cell.isMarked = !cell.isMarked;
	cell.isShown = !cell.isShown;

	// if cell was a mine, add 1 to marked count
	// if correct flag is removed decrease the count
	if (cell.isMine) cell.isMarked ? gGame.markedCount++ : gGame.markedCount--;

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

			renderSmiley(WIN_SMILEY);
		}
	}
}
