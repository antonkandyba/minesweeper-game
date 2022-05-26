'use strict';

const SAFE_CLICK = '🎯';

var gHints = {
	isHintsClicked: false,
	hintTimeout: 0,
	hintOrigCells: [],
	safeClickCount: 3,
	safeClickTimeout: 0,
	safeCell: null,
};

function clickHint(elHints) {
	if (!gGame.isOn) return;
	// if hints is already clicked, cancel the glow and do nothing
	if (gHints.isHintsClicked) {
		elHints.style.textShadow = '';
		gHints.isHintsClicked = false;
		return;
	}

	// do nothing if we have no hints left
	if (gGame.hintsCount === 0) return;

	gHints.isHintsClicked = true;

	elHints.style.textShadow =
		'0 0 3px #fff, 0 0 5px #fff, 0 0 7px #fff,' +
		'0 0 10px #a2c00e, 0 0 15px #f5f507,0 0 20px #f3ef09';
}

function revealNeighbours(elCell) {
	var cellI = +elCell.dataset.i;
	var cellJ = +elCell.dataset.j;
	gHints.hintOrigCells = [];

	// loop through neighbourg and the cell itself
	for (var i = cellI - 1; i <= cellI + 1; i++) {
		if (i < 0 || i >= gBoard.length) continue;

		for (var j = cellJ - 1; j <= cellJ + 1; j++) {
			if (j < 0 || j >= gBoard[0].length) continue;

			// keep original i, j , and if it was shown before
			var cellInfo = { i, j, isShown: gBoard[i][j].isShown };
			gHints.hintOrigCells.push(cellInfo);

			// reveal the cells
			gBoard[i][j].isShown = true;
		}
	}

	renderBoard(gBoard);
}

function hideNeighbours() {
	// set to 0 so we can click on all cells again
	gHints.hintTimeout = 0;

	for (var i = 0; i < gHints.hintOrigCells.length; i++) {
		var cellInfo = gHints.hintOrigCells[i];

		gBoard[cellInfo.i][cellInfo.j].isShown = cellInfo.isShown;
	}

	gHints.isHintsClicked = false;

	renderBoard(gBoard);
}

function safeClick() {
	// do nothing if game is not on
	if (!gGame.isOn) return;
	// do nothing if we have no safe clicks left
	if (gHints.safeClickCount === 0) return;
	// dont show multiple hints at once
	if (gHints.safeClickTimeout) return;

	gHints.safeClickCount--;

	gHints.safeCell = getRandomSafeCell();
	if (!gHints.safeCell) return;

	gHints.safeCell.isHinted = true;

	renderBoard(gBoard);
	renderSafeClick();

	gHints.safeClickTimeout = setTimeout(clearSafeClick, 1500);
}

function getRandomSafeCell() {
	var safeCells = [];

	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var cell = gBoard[i][j];
			// if cell is hidden and not a mine
			if (!cell.isShown && !cell.isMine) {
				safeCells.push(cell);
			}
		}
	}
	// if ther are no safe clicks on the board
	if (safeCells.length === 0) return null;

	var randIdx = getRandomInt(0, safeCells.length);
	return safeCells.splice(randIdx, 1)[0];
}

function clearSafeClick() {
	gHints.safeCell.isHinted = false;
	gHints.safeClickTimeout = 0;
	renderBoard(gBoard);
}

function renderSafeClick() {
	var elSafe = document.querySelector('#safe-click');

	// if no hints left, insert a hidden div to keep the spacing
	if (gHints.safeClickCount > 0) {
		elSafe.innerText = SAFE_CLICK.repeat(gHints.safeClickCount);
	} else {
		elSafe.innerHTML = '<div style="visibility:hidden; height:21px;"></div>';
	}
}
