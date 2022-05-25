'use strict';

var gHints = {
	isHintsClicked: false,
	hintTimeout: 0,
	hintOrigCells: [],
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
