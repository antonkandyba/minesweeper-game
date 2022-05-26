'use strict';

var gManualMode = {
	isOn: false,
	mines: [],
	prevBombCount: 0,
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
