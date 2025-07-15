
function createBoard(color,boardLocation) {
    const board = document.getElementById(boardLocation);
    const boardFragment = document.createDocumentFragment(); 
    const boardArray = []; 

    if (color === 'white') {
        let id = 0;
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const square = document.createElement("div"); 
                square.dataset.row = row; 
                square.dataset.col = col; 
                square.classList.add("square"); 

                if ((row + col) % 2 === 0) {
                    square.classList.add("white-square"); 
                } else {
                    square.classList.add("black-square"); 
                    id++;
                    if (row < 4) { 
                        const piece = document.createElement("div");
                        piece.classList.add("black-piece"); 
                        piece.dataset.id = id;
                        square.appendChild(piece); 
                    } else if (row > 5) { 
                        const piece = document.createElement("div");
                        piece.classList.add("white-piece"); 
                        piece.dataset.id = id;
                        square.appendChild(piece); 
                    }
                }

                boardFragment.appendChild(square); 
                boardArray.push(square); 
            }
        }

    } else { 
        let id = 24;
        for (let row = 8; row >= 1; row--) {
            for (let col = 8; col >= 1; col--) {
                const square = document.createElement("div"); 
                square.dataset.row = row; 
                square.dataset.col = col; 
                square.classList.add("square"); 

                if ((row + col) % 2 === 0) {
                    square.classList.add("white-square"); 
                } else {
                    square.classList.add("black-square"); 
                    id--;
                    if (row < 4) { 
                        const piece = document.createElement("div");
                        piece.classList.add("black-piece"); 
                        piece.dataset.id = id;
                        square.appendChild(piece); 
                    } else if (row > 5) { 
                        const piece = document.createElement("div");
                        piece.classList.add("white-piece"); 
                        piece.dataset.id = id;
                        square.appendChild(piece); 
                    }
                }

                boardFragment.appendChild(square); 
                boardArray.push(square); 
            }
        }
    }

    board.appendChild(boardFragment); 
    return boardArray; 
}
