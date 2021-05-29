const getMatrix = (columns, rows) => {
    const matrix = [];
    let idCounter = 0;
    for (let y = 0; y < columns; y++) {
        const row = [];
        for (let x = 0; x < rows; x++) {
            row.push({
                id: idCounter++,
                x,
                y,
                show: false,
                flag: false,
                mine: false,
                left: false,
                right: false,
                number: 0
            })
        }
        matrix.push(row);
    }
    return matrix;
}

const getMines = (matrix) => {
    let countMine = 0;
    let countFree = 0;
    for (let row of matrix) {
        for (let cell of row) {
            if (cell.mine) countMine++;
            else {
                countFree++
            }
        }
    }
    gameInformation.flags = countMine
    gameInformation.mines = countMine
    gameInformation.freeCells = countFree

}

const gameInformation = {
    flags: 0,
    mines: 0,
    freeCells: 0,
    getMines: getMines,
}

const setRandomMine = (matrix) => {
    const cell = getRandomCell(matrix);
    cell.mine = true;
    const cellAroundCollection = getAroundCells(matrix, cell.x, cell.y);
    for (let cellAround of cellAroundCollection) {
        cellAround.number++;
    }
}

const gameConstructor = (matrix) => {
    const mineSweeperWrap = document.createElement('div');
    mineSweeperWrap.className = 'sapper';
    for (let i = 0; i < matrix.length; i++) {
        let row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < matrix[i].length; j++) {
            let element = matrix[i][j];
            let circle = document.createElement('img');
            circle.addEventListener("mousedown", mouseDownHandler);
            circle.addEventListener("mouseup", mouseUpHandler);
            circle.addEventListener("mouseleave", mouseLeaveHandler);
            circle.setAttribute('data-circle-id', element.id);
            circle.oncontextmenu = () => false;
            circle.draggable = false;
            row.append(circle);
            if (element.flag) {
                circle.src = './assets/flagged.png'
                continue
            }
            if (!element.show) {
                circle.src = './assets/facingDown.png'
                continue
            }
            if (element.mine) {
                circle.src = './assets/bomb.png'
                continue
            }
            if (element.number) {
                circle.src = `./assets/${element.number}.png`
                continue
            }
            circle.src = './assets/0.png'
        }
        mineSweeperWrap.append(row);
    }
    return mineSweeperWrap
}

const endGame = (result) => {
    const body = document.querySelector('body');
    const modalWindow = document.createElement('div');
    const highlightModalWindow = document.createElement('div');
    const buttonsWrapper = document.createElement('div');
    const startNewGame = document.createElement('div');
    const closeWindow = document.createElement('div');

    modalWindow.classList.add('modal__window');
    highlightModalWindow.classList.add('highlight__modal__window');
    startNewGame.classList.add('start__new__game');
    closeWindow.classList.add('close__window');
    buttonsWrapper.classList.add('buttons__wrapper');

    body.append(highlightModalWindow);
    highlightModalWindow.append(modalWindow);
    result === 'win' ? modalWindow.innerHTML = `Congratulations! You are winner! <br>
You were able to avoid all the bottles and didn't no seat on one!` :
        modalWindow.innerHTML = `Unfortunately you sat down on the bottle!<br>
I regret about your ass...<br>
You can try again, if you wish!`;

    modalWindow.append(buttonsWrapper);
    buttonsWrapper.append(startNewGame, closeWindow);
    startNewGame.innerHTML = `New game`;
    closeWindow.innerHTML = `F*ck it!`;

    startNewGame.addEventListener('click', newGame);
    closeWindow.addEventListener('click', closeGame);
}

const newGame = () => {
    document.location.reload();
}

const closeGame = () => {
    window.close();
}

const leftClickHandler = (cellObject) => {
    if (!cellObject.show) gameInformation.freeCells--
    cellObject.show = cellObject.flag ? !cellObject.flag : true;
    if (!gameInformation.freeCells) endGame('win');
    if (!cellObject.mine && cellObject.number === 0) areaOpen(cellObject);
    update(matrix);
    if (cellObject.mine) return endGame('lose');
}

const rightClickHandler = (cellObject) => {
    if (cellObject.flag) {
        gameInformation.flags++
        cellObject.flag = false
    } else if (gameInformation.flags === 0) {
        return
    } else if (!cellObject.show) {
        gameInformation.flags--
        cellObject.flag = true;
    }
    update(matrix);
}

const bothClickHandler = (cellObject) => {
    const aroundCells = getAroundCells(matrix, cellObject.x, cellObject.y);
    let flagCells = 0;
    for (let cell of aroundCells) {
        if (cell.flag) flagCells++;
    }
    if (cellObject.number !== 0 && flagCells === 0) {
        addFilter(aroundCells);
    }
    if (cellObject.number === flagCells) openAroundCellsByFlag(aroundCells);
}

const openAroundCellsByFlag = (aroundCells) => {
    aroundCells.forEach(cell => {
        if (!cell.flag) cell.show = true;
        if (cell.mine && !cell.flag) endGame('lose');
    });
}

const addFilter = (aroundCells) => {
    aroundCells.forEach(cell => {
        if (!cell.show) {
            const nodeCell = document.querySelector(`img[data-circle-id="${cell.id}"]`);
            nodeCell.style.filter = 'opacity(0.5)';
        }
    });
}

const removeFilter = (aroundCells) => {
    aroundCells.forEach(cell => {
        if (!cell.show) {
            const nodeCell = document.querySelector(`img[data-circle-id="${cell.id}"]`);
            nodeCell.style.filter = '';
        }
    });
}

const getAroundCells = (matrix, x, y) => {
    const aroundCells = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            (dx !== 0 || dy !== 0) ? !matrix[y + dy] || !matrix[y + dy][x + dx] ? false : aroundCells.push(matrix[y + dy][x + dx]) : false
        }
    }
    return aroundCells;
}

const getInfo = (e) => {
    let buttonNumber = e.button;
    let cellId = e.target.getAttribute('data-circle-id');
    let cellObject = getCellObject(cellId);
    return {
        left: buttonNumber === 0,
        right: buttonNumber === 2,
        cellObject
    }
}

const getCellObject = (cellId) => {
    for (let row of matrix) {
        for (let cell of row) {
            if (cell.id == cellId) return cell;
        }
    }
}

const getRandomCell = (matrix) => {
    const freeCell = [];
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            const cell = matrix[y][x];
            if (!cell.mine) freeCell.push(cell);
        }
    }
    let indexCell = Math.floor(Math.random() * freeCell.length);
    return freeCell[indexCell];
}

const mouseDownHandler = (e) => {
    let {left, right, cellObject} = getInfo(e)
    if (left) cellObject.left = true;
    if (right) cellObject.right = true;
    if (cellObject.left && cellObject.right) bothClickHandler(cellObject);
}

const mouseUpHandler = (e) => {
    let {left, right, cellObject} = getInfo(e);

    const aroundCells = getAroundCells(matrix, cellObject.x, cellObject.y);
    const both = cellObject.left && cellObject.right && (left || right);
    const mouseLeft = !both && cellObject.left && left;
    const mouseRight = !both && cellObject.right && right;

    if (left) cellObject.left = false;
    if (right) cellObject.right = false;
    if (mouseLeft) leftClickHandler(cellObject);
    if (mouseRight) rightClickHandler(cellObject);

    removeFilter(aroundCells);
}

const mouseLeaveHandler = (e) => {
    let {cellObject} = getInfo(e);
    cellObject.left = false;
    cellObject.right = false;
}

const areaOpen = (cellObject) => {
    const aroundCells = getAroundCells(matrix, cellObject.x, cellObject.y);
    aroundCells.forEach(cell => {
        if (cell.number === 0 && !cell.flag && !cell.mine && !cell.show) {
            gameInformation.freeCells--
            cell.show = true;
            areaOpen(cell);
        }
        if (cell.number > 0 && !cell.flag && !cell.mine && !cell.show) {
            cell.show = true;
            gameInformation.freeCells--
        }
    });
}