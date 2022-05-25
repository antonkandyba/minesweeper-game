'use strict';

const STANDARD_SMILEY = '🙂';
const WIN_SMILEY = '😎';
const LOSE_SMILEY = '😖';
const LIFE = '💗';
const HINT = '💡';

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
			if (cell.isBlown) cellClass += ' blown';

			// set cell content according to the cell
			var cellContent = EMPTY;
			if (cell.mineAroundCount > 0) cellContent = cell.mineAroundCount;
			else if (cell.isMine) cellContent = MINE;

			// show a flag if the cell is marked no matter the content
			if (cell.isMarked) cellContent = FLAG;

			boardHTML += `<td ${cellData} class="${cellClass}" 
                            onclick="cellClicked(this)"
                            oncontextmenu="cellMarked(this, event)">
                            ${cellContent}
                          </td>`;
		}

		boardHTML += '</tr>';
	}

	boardHTML += getBoardFooter();

	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = boardHTML;

	renderLives();
	renderHints();

	preventTdContextMenu();
}

function getBoardFooter() {
	return `<tr>
                <td colspan="${gBoard[0].length}">
                    <div class ="footer-flex">
                        <div class="lives-count"></div>
                        <div class="hints-count" onclick="clickHint(this)"></div>
                    </div>
                </td>
            </tr>`;
}

function renderLives() {
	var elLives = document.querySelector('.lives-count');

	var lives = LIFE.repeat(gGame.livesCount);

	elLives.innerText = lives;
}

function renderHints() {
	var elHints = document.querySelector('.hints-count');
	var hints = HINT.repeat(gGame.hintsCount);

	if (gHints.isHintsClicked) {
		elHints.style.textShadow =
			'0 0 3px #fff, 0 0 5px #fff, 0 0 7px #fff,' +
			'0 0 10px #a2c00e, 0 0 15px #f5f507,0 0 20px #f3ef09';
	}

	elHints.innerText = hints;
}

function renderSmiley(smiley) {
	var elBtn = document.querySelector('.board-header button');
	elBtn.innerText = smiley;
}

function renderTimer() {
	var timeNow = new Date();

	var seconds = Math.floor((timeNow - gGame.startTime) / 1000);

	// make the timer alway 3 chars long
	if (seconds < 10) seconds = '00' + seconds;
	else if (seconds < 100) seconds = '0' + seconds;
	else if (seconds > 999) seconds = '999';

	var elTimer = document.querySelector('.timer');
	elTimer.innerText = seconds;
}

function renderFlagsCount() {
	// count how many flags we still need to place
	var displayFlags = gLevel.mines - gGame.flagsCount;

	// make the counter alway 3 chars long
	if (displayFlags <= -10) displayFlags = displayFlags;
	else if (displayFlags < 0) displayFlags = '-0' + -displayFlags;
	else if (displayFlags === 0) displayFlags = '000';
	else if (displayFlags < 10) displayFlags = '00' + displayFlags;
	else if (displayFlags < 100) displayFlags = '0' + displayFlags;

	var elFlags = document.querySelector('.flags-count');
	elFlags.innerText = displayFlags;
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

function renderHighScores() {
	var beginnerScore = localStorage.getItem('beginnerScore');
	var mediumScore = localStorage.getItem('mediumScore');
	var expertScore = localStorage.getItem('expertScore');

	if (!beginnerScore) beginnerScore = 0;
	if (!mediumScore) mediumScore = 0;
	if (!expertScore) expertScore = 0;

	var elBeginner = document.querySelector('#beginner-score');
	var elMedium = document.querySelector('#medium-score');
	var elExpert = document.querySelector('#expert-score');

	elBeginner.innerText = beginnerScore;
	elMedium.innerText = mediumScore;
	elExpert.innerText = expertScore;
}

// gets random position on the board
function getRandomMinePositions(board, mineCount, pos) {
	var cells = [];

	// get objects for all possible cells
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			// exclude first click from possible mine positions
			if (!(i === +pos.i && j === +pos.j)) {
				cells.push({ i, j });
			}
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

// print values of table for debugging
function printTable(board) {
	var mat = [];

	for (var i = 0; i < board.length; i++) {
		mat.push([]);
		for (var j = 0; j < board[i].length; j++) {
			var cell = board[i][j];

			if (cell.isMarked) mat[i][j] = FLAG;
			else if (cell.isMine) mat[i][j] = MINE;
			else if (cell.mineAroundCount > 0) mat[i][j] = cell.mineAroundCount;
			else mat[i][j] = EMPTY;
		}
	}

	console.table(mat);
}

// show all mines (when you lose)
function revealAllMines(gBoard) {
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[i].length; j++) {
			var cell = gBoard[i][j];
			if (cell.isMine) cell.isShown = true;
			// show wrong flags
			if (cell.isMarked && !cell.isMine) cell.isBlown = true;
		}
	}
}
