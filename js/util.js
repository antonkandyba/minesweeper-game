'use strict';

function renderBoard(board) {
	var boardHTML = '';
	var elHeader = document.querySelector('.board-header');
	elHeader.colSpan = gBoard.length;

	for (var i = 0; i < board.length; i++) {
		boardHTML += '<tr>';

		for (var j = 0; j < board[i].length; j++) {
			var cell = board[i][j];
			var cellData = `data-i="${i}" data-j="${j}"`;
			var cellClass = cell.isMine ? 'mine' : `number${cell.mineAroundCount}`;
			cellClass += cell.isShown ? ' shown' : ' hidden';

			// show empty cell if count is 0
			var cellContent = cell.mineAroundCount ? cell.mineAroundCount : EMPTY;
			// show a mine if the cell contains a mine
			cellContent = cell.isMine ? MINE : cellContent;

			boardHTML += `<td ${cellData} class="${cellClass}" 
                            onclick="cellClicked(this)"
                            oncontextmenu="cellMarked(this, event)">
                            ${cellContent}
                          </td>`;
		}

		boardHTML += '</tr>';
	}

	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = boardHTML;

	preventTdContextMenu();
}

// builds an empty square board
function buildEmptyBoard(size) {
	var board = [];

	for (var i = 0; i < size; i++) {
		board.push([]);
		for (var j = 0; j < size; j++) {
			board[i][j] = EMPTY;
		}
	}
	return board;
}

// gets random position on the board
function getRandomMinePositions(board, mineCount) {
	var cells = [];

	// get objects for all possible cells
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			cells[i * board.length + j] = { i, j };
		}
	}

	var mines = [];

	// get needed amount of random positions
	for (var i = 0; i < mineCount; i++) {
		var randIdx = getRandomInt(0, cells.length);
		var randPos = cells.splice(randIdx, 1)[0];
		mines.push(randPos);
	}

	return mines;
}

// return mines count around the cell
function countNegMines(board, cellI, cellJ) {
	var count = 0;

	for (var i = cellI - 1; i <= cellI + 1; i++) {
		if (i < 0 || i >= board.length) continue;

		for (var j = cellJ - 1; j <= cellJ + 1; j++) {
			if (j < 0 || j >= board[0].length) continue;
			if (i === cellI && j === cellJ) continue;
			// empty cell can't be a mine
			if (board[i][j] === EMPTY) continue;

			if (board[i][j].isMine) count++;
		}
	}

	return count;
}

// prevents opening context menus on cells in the table.
function preventTdContextMenu() {
	var elTDs = document.querySelectorAll('.game-container td');
	elTDs.forEach((el) => el.addEventListener('contextmenu', (e) => e.preventDefault()));

	var elTable = document.querySelectorAll('.game-container table');
	elTable.forEach((el) => el.addEventListener('contextmenu', (e) => e.preventDefault()));
}

//The maximum is exclusive and the minimum is inclusive
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}
