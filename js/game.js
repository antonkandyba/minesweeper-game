'use strict';

// constants
var EMPTY = '';
var MINE = '💣';

// global variables
var gBoard;
var gLevel = {
	size: 4,
	mines: 2,
};
var gGame = {
	isOn: false,
	markedCount: 0,
	timer: 0,
};

function initGame(size = gLevel.size, mineCount = gLevel.mines) {
	gBoard = buildEmptyBoard(size);
	gLevel.size = size;
	gLevel.mines = mineCount;

	buildBoard(gBoard);
	renderBoard(gBoard);

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
				};
			}
		}
	}
}

function cellClicked(elCell) {
	// do nothing if game is not on
	if (!gGame.isOn) return;

	var cell = gBoard[elCell.dataset.i][elCell.dataset.j];
	// if cell is clicked, show it
	cell.isShown = true;

	renderBoard(gBoard);
}

function cellMarked(elCell, event) {
	// do nothing if game is not on
	if (!gGame.isOn) return;

	console.log('hi!');
}
