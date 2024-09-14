document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('bg-container').classList.remove('loader');
    setTimeout(() => {
        document.getElementById('content').classList.remove("hidden");
    }, 200);
    
});




let currentPlayer = 'blue';
let cells = document.querySelectorAll('.cell-container');
let size = 3;
let statp = document.querySelector("p#stat");
let connections = [];
let resetButton = document.getElementById("reset");
let tmo;
resetButton.addEventListener("click", () => {resetGame(); animateReset();});

changeSize();

document.getElementById("size").setAttribute("onchange", "changeSize()");

function animateReset() {
    if(!tmo) {
        resetButton.querySelectorAll('.icon')[0].setAttribute('style', 'animation: rotate-pulse 0.6s'); 
        tmo = setTimeout(() => {
            resetButton.querySelectorAll('.icon')[0].setAttribute('style', '')
            tmo = undefined;
        }, 600);
    }
}

function resetGame() {
    for (let i = 0; i < board.length; i++) {
        board[i] = '';
    }
    cells.forEach(cell => {cell.classList = 'cell-container'; cell.innerHtml = "<div class='cell'></div>"});
    for (const con of document.querySelectorAll(".connection")) con.remove();
    currentPlayer = 'blue';
    statp.innerHTML = 'The <span class="blue">blue</span> player goes first';
    document.body.style.backgroundColor = "#eee";
    size = document.querySelector("#size").value;
    connections = Array(size*size).fill().map(()=>Array(size*size).fill(false));
    resetButton.addEventListener("click", () => {animateReset();});
    console.log("board", board, "connections", connections)
}

function cellClick(index) {
    console.log("connections", connections);
    if (board[index] === '' && !isGameOver()) {
        board[index] = currentPlayer;
        cells[index].classList.add(currentPlayer);
        checkConnections(index);
        if (isWinner()) {
            statp.innerHTML = `The <span class="${currentPlayer}">${currentPlayer}</span> player won!`;
            document.body.style.backgroundColor = currentPlayer;
        } else if (isBoardFull()) {
            statp.innerHTML = 'Tie!';
            document.body.style.backgroundColor = "#40bf70";
        } else {
            currentPlayer = currentPlayer == 'blue' ? 'red' : 'blue';
            statp.innerHTML = `Turn of the <span class="${currentPlayer}">${currentPlayer}</span> player`;
        }
    }
}

function checkConnections(i) {
    let fill = currentPlayer == "blue" ? "#0062ff" : "#e3002d";
    let neighbors = findNeighbors(i);
    neighbors.forEach(neighbor => {
        console.log("connections", connections);
        let deg = 45;
        deg = deg * (neighbor["direction"] - 1);
        console.log("deg", deg)
        if (!connections[i][neighbor['ni']]) {

            let connection = `
                <svg class="connection" style="transform: translate(-50%,-50%) rotate(${deg}deg);" xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%" viewBox="0 0 207.34 208.34">
                    <path 
                        id="cellpath${i+'-'+neighbor["ni"]}"
                        d="M183.56,83a30,30,0,0,1-21.22,51.21h-4c-38.36,0,54.8,13.12,16.05,46.93q-1.65,1.52-3.39,3l-.12.1h0a104.17,104.17,0,1,1,0-160l.12.1c1.16,1,2.29,1.95,3.39,3C213.15,61,120,74.17,158.34,74.17h4A29.9,29.9,0,0,1,183.56,83Z"
                        fill="${fill}"
                    />
                    <animate 
                        xlink:href="#cellpath${i+'-'+neighbor["ni"]}"
                        attributeName="d"
                        attributeType="XML"
                        from="M183.56,83a30,30,0,0,1-21.22,51.21h-4c-38.36,0,54.8,13.12,16.05,46.93q-1.65,1.52-3.39,3l-.12.1h0a104.17,104.17,0,1,1,0-160l.12.1c1.16,1,2.29,1.95,3.39,3C213.15,61,120,74.17,158.34,74.17h4A29.9,29.9,0,0,1,183.56,83Z"
                        to="M357.56,83a30,30,0,0,1-21.22,51.21h-68c-38.36,0-55.2,13.12-94,46.93q-1.65,1.52-3.39,3l-.12.1h0a104.17,104.17,0,1,1,0-160l.12.1c1.16,1,2.29,1.95,3.39,3C213.15,61,230,74.17,268.34,74.17h68A29.9,29.9,0,0,1,357.56,83Z"
                        dur="0.2s"
                        fill="freeze" 
                    />
                </svg>`;
            cells[i].innerHTML += connection; 
            connections[i][neighbor['ni']] = true;
        }
        if (!connections[neighbor['ni']][i]) checkConnections(neighbor['ni']);
    });
}

function findNeighbors(index) {
    const neighbors = [];
    let row = Math.floor(index / size);
    let col = index % size;
    console.log(row, col);
    for (let i = row - 1; i <= row + 1; i++) {
        for (let j = col - 1; j <= col + 1; j++) {
            if (i >= 0 && i < size && j >= 0 && j < size && !(i === row && j === col)) {
                ni = i * size + j;
                console.log("i", i, "j", j, index, ni)
                const neighborCell = board[ni];
                console.log("board", board[index], neighborCell);
                if (neighborCell && neighborCell === board[index]) {
                    const direction = getDirection(row, col, i, j);
                    neighbors.push({ ni, direction });
                }
            }
        }
    }
    console.log("neighbors", neighbors);
    return neighbors;
}

function getDirection(row, col, neighborRow, neighborCol) {
    if (row === neighborRow && col < neighborCol) return '1'; //right
    if (row < neighborRow && col < neighborCol) return '2'; //down-right
    if (row < neighborRow && col === neighborCol) return '3'; //down
    if (row < neighborRow && col > neighborCol) return '4'; //down-left
    if (row === neighborRow && col > neighborCol) return '5'; //left
    if (row > neighborRow && col > neighborCol) return '6'; //up-left
    if (row > neighborRow && col === neighborCol) return '7'; //up
    if (row > neighborRow && col < neighborCol) return '8'; //up-right
}

function isWinner() {
    const winPatterns = generateWinPatterns();
    return winPatterns.some(pattern => {
        const symbols = pattern.map(index => board[index]);
        const firstSymbol = symbols[0];
        return symbols.every(symbol => symbol === firstSymbol && symbol !== '');
    });
}



function generateWinPatterns() {
    const winPatterns = [];

    // Horizontal and Vertical patterns
    for (let i = 0; i < size; i++) {
        const row = [];
        const col = [];
        for (let j = 0; j < size; j++) {
            row.push(i * size + j);
            col.push(j * size + i);
        }
        winPatterns.push(row, col);
    }

    // Diagonal patterns
    const diagonal1 = [];
    const diagonal2 = [];
    for (let i = 0; i < size; i++) {
        diagonal1.push(i * size + i);
        diagonal2.push((size - 1 - i) * size + i);
    }
    winPatterns.push(diagonal1, diagonal2);

    return winPatterns;
}


function isBoardFull() {
    return board.every(cell => cell !== '');
}

function isGameOver() {
    return isWinner() || isBoardFull();
}



function changeSize() {
    resetGame();
    size = Number(document.querySelector("#size").value);
    let boardContainer = document.getElementById("board");
    board = Array(size*size).fill('');
    boardContainer.classList = "x" + size;
    let cell = cells[0];
    cells.forEach(cell => cell.remove());
    for (let i = 0; i < size * size; i++) boardContainer.append(cell.cloneNode(true));
    cells = document.querySelectorAll('.cell-container');
    cells.forEach((cell, index) => {
        cell.querySelectorAll(".cell")[0].setAttribute("onclick", `cellClick(${index})`);
    });
    connections = Array(size*size).fill().map(()=>Array(size*size).fill(false));
}

// let modal = document.getElementById("modal");
// let content = document.getElementById("content");
// // document.getElementById()

// function openModal() {
//     content.classList.add("hidden");

// }