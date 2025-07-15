let selectedPiece = null;
let currentPlayer = "white";
let whiteCapturedPieces = 0;
let blackCapturedPieces = 0;
let turnCount = 0;
let turnData = [];


function saveTurnData(fromX, fromY, toX, toY, type = "onlyMove", capturedData) {
    turnData = turnData.filter(turn => turn.turn <= turnCount);
    
    let movedPiece = document.querySelector(`[data-row='${fromX}'][data-col='${fromY}'] div`);
    let pieceId = movedPiece ? movedPiece.dataset.id : null;

    let turnInfo = {
        turn: ++turnCount,
        from: [fromX, fromY],
        to: [toX, toY],
        player: currentPlayer,
        pieceId: pieceId,
        type: type
    };

    if (type === "capture") {
        if (capturedData) {
            turnInfo.captured = {
                position: [capturedData.row, capturedData.col],
                player: capturedData.player,
                wasQueen: capturedData.wasQueen
            };
        } else {
            console.warn("Capture move made, but no captured piece provided!");
        }
    }

    turnData.push(turnInfo);
    console.log(`Turn ${turnCount}:`, turnInfo);
}

function undoLastMove() {
    if (turnData.length === 0 || turnCount === 0) {
        console.warn("No moves to undo.");
        return;
    }

    let lastMove = turnData[turnCount - 1];
    let { from, to, player, type, captured } = lastMove;

    let fromSquare = document.querySelector(`[data-row='${from[0]}'][data-col='${from[1]}']`);
    let toSquare = document.querySelector(`[data-row='${to[0]}'][data-col='${to[1]}']`);
    let movedPiece = toSquare ? toSquare.querySelector(".white-piece, .black-piece") : null;

    if (!movedPiece) {
        console.error("No piece found to move back!");
        return;
    }

    if (movedPiece && movedPiece.classList.contains("queen")) {
        let wasAlwaysQueen = false;
        let player = movedPiece.classList.contains("white-piece") ? "white" : "black";
        let targetRow = player === "white" ? 1 : 8;
        let pieceId = movedPiece.dataset.id; 
    
        for (let i = 0; i < turnCount-1; i++) {
            let move = turnData[i];
    
            if (move.player === player && move.to[0] === targetRow && move.pieceId == pieceId) {
                wasAlwaysQueen = true;
                break;
            }
        }
    
        if (!wasAlwaysQueen) {
            movedPiece.classList.remove("queen");
        }
    }    

    fromSquare.appendChild(movedPiece);

    if (captured && captured.position) {
        let capturedSquare = document.querySelector(`[data-row='${captured.position[0]}'][data-col='${captured.position[1]}']`);
        
        if (capturedSquare) {
            let restoredPiece = document.createElement("div");
            restoredPiece.classList.add(player === "white" ? "black-piece" : "white-piece");

            if (captured.wasQueen) {
                restoredPiece.classList.add("queen");
            }

            if (player === "white") {
                whiteCapturedPieces = Math.max(0, whiteCapturedPieces - 1);
            } else {
                blackCapturedPieces = Math.max(0, blackCapturedPieces - 1);
            }

            capturedSquare.appendChild(restoredPiece);
        } else {
            console.error("Captured square not found.");
        }
    }

    currentPlayer = currentPlayer === "white" ? "black" : "white";
    turnCount--;

    console.log(`Move undone: Player ${player} move ${turnCount} reverted.`);
}

function redoLastMove() {
    if (!Array.isArray(turnData) || turnData.length === 0) {
        console.warn("No moves to redo.");
        return;
    }

    if (turnCount >= turnData.length) {
        console.warn("No moves to redo.");
        return;
    }

    let nextMove = turnData[turnCount];
    let { from, to, player, type, captured } = nextMove;

    let fromSquare = document.querySelector(`[data-row='${from[0]}'][data-col='${from[1]}']`);
    let toSquare = document.querySelector(`[data-row='${to[0]}'][data-col='${to[1]}']`);
    
    if (!fromSquare || !toSquare) {
        console.error("Invalid move positions.");
        return;
    }

    let movedPiece = fromSquare.querySelector(".white-piece, .black-piece");

    if (!movedPiece) {
        console.error("No piece found to move ahead!");
        return;
    }

    let movedPlayer = movedPiece.classList.contains("white-piece") ? "white" : "black";
    let targetRow = movedPlayer === "white" ? 1 : 8;

    if (to[0] === targetRow) {
        movedPiece.classList.add("queen");
    }

    toSquare.appendChild(movedPiece);

    if (captured && captured.position) {
        let capturedSquare = document.querySelector(`[data-row='${captured.position[0]}'][data-col='${captured.position[1]}']`);
        if (capturedSquare) {
            capturedSquare.innerHTML = '';
            if (player === "white") {
                whiteCapturedPieces = Math.max(0, whiteCapturedPieces + 1);
            } else {
                blackCapturedPieces = Math.max(0, blackCapturedPieces + 1);
            }
        } else {
            console.error("Captured square not found.");
        }
    }

    currentPlayer = currentPlayer === "white" ? "black" : "white";
    turnCount = Math.min(turnCount + 1, turnData.length);

    console.log(`Move redone: ${player} moved from (${from[0]}, ${from[1]}) to (${to[0]}, ${to[1]})`);
}

function hasMandatoryCapture() {
    if (!currentPlayer) {
        console.error("Error: currentPlayer is not defined.");
        return false;
    }

    const pieces = document.querySelectorAll(`.${currentPlayer}-piece`);
    
    return Array.from(pieces).some(piece => {
        if (!piece.parentElement) {
            console.warn("Warning: A piece is missing its parent element.");
            return false;
        }

        const isQueen = piece.classList.contains("queen");

        if (typeof hasMoreCaptures !== "function" || typeof hasMoreCapturesQueen !== "function") {
            console.error("Error: Required capture functions are missing.");
            return false;
        }

        return isQueen ? hasMoreCapturesQueen(piece.parentElement) : hasMoreCaptures(piece.parentElement);
    });
}

function capturePiece(piece) {
    piece.remove();
    if (piece.classList.contains("white-piece")) {
        blackCapturedPieces++;
        debugInfo(`Black player captured a white piece. Total captured: ${blackCapturedPieces}`);
    } else if (piece.classList.contains("black-piece")) {
        whiteCapturedPieces++;
        debugInfo(`White player captured a black piece. Total captured: ${whiteCapturedPieces}`);
    }
    checkWinner();
}

function checkWinner() {
    debugInfo(`Checking winner. White captured: ${whiteCapturedPieces}, Black captured: ${blackCapturedPieces}`);
    if (whiteCapturedPieces === 12) {
        alert("White player wins!");
        if (gameMode === "offline") {
            resetGame();
        }
    } else if (blackCapturedPieces === 12) {
        alert("Black player wins!");
        if (gameMode === "offline") {
            resetGame();
        }
    }
}

function handleSquareClick(event) {
    let square = event.target;
    let piece = square.querySelector(".white-piece, .black-piece");

    if (square.classList.contains("white-piece") || square.classList.contains("black-piece")) {
        piece = square;
        square = piece.parentElement;
    }

    debugInfo(`Square clicked. Target is: ${square}, Piece: ${piece}`);

    if (piece && piece.classList.contains(`${currentPlayer}-piece`)) {
        if (selectedPiece) selectedPiece.classList.remove("selected");
        selectedPiece = piece;
        selectedPiece.classList.add("selected");
        debugInfo(`${currentPlayer} player selected a piece.`);
    } 

    else if (selectedPiece === piece) {
        selectedPiece.classList.remove("selected");
        selectedPiece = null;
        debugInfo("Selection cleared.");
    } 

    else if (selectedPiece && !piece) {
        const selectedRow = parseInt(selectedPiece.parentElement.dataset.row);
        const selectedCol = parseInt(selectedPiece.parentElement.dataset.col);
        const targetRow = parseInt(square.dataset.row);
        const targetCol = parseInt(square.dataset.col);

        debugInfo(`Attempting move. Selected: (${selectedRow}, ${selectedCol}), Target: (${targetRow}, ${targetCol})`);


        if (hasMandatoryCapture() && !isValidCapture(selectedRow, selectedCol, targetRow, targetCol)
            && !isValidQueenCapture(selectedRow, selectedCol, targetRow, targetCol)) {
            debugInfo("You must capture a piece if possible!");
            return;
        }

        if (gameMode === 'offline') {

            if (selectedPiece.classList.contains("queen")) {
                if (
                    square.classList.contains("black-square") &&
                    isValidQueenMove(selectedRow, selectedCol, targetRow, targetCol) &&
                    !isValidQueenCapture(selectedRow, selectedCol, targetRow, targetCol) &&
                    !square.hasChildNodes()
                ) {
                    saveTurnData(selectedRow, selectedCol, targetRow, targetCol);
                    movePiece(square, true);
                } 

                else if (isValidQueenCapture(selectedRow, selectedCol, targetRow, targetCol)) {
                    handleCapture(selectedRow, selectedCol, targetRow, targetCol, square);
                } 

                else {
                    debugInfo("Invalid move.");
                    clearSelection();
                }
            } else {

                if (
                    square.classList.contains("black-square") &&
                    selectedPiece.classList.contains("white-piece") &&
                    targetRow - selectedRow === -1 &&
                    Math.abs(targetCol - selectedCol) === 1 &&
                    !square.hasChildNodes()
                ) {
                    saveTurnData(selectedRow, selectedCol, targetRow, targetCol);
                    movePiece(square, true);
                } else if (
                    square.classList.contains("black-square") &&
                    selectedPiece.classList.contains("black-piece") &&
                    targetRow - selectedRow === 1 &&
                    Math.abs(targetCol - selectedCol) === 1 &&
                    !square.hasChildNodes()
                ) {
                    saveTurnData(selectedRow, selectedCol, targetRow, targetCol);
                    movePiece(square, true);
                }

                else if (
                    Math.abs(targetRow - selectedRow) === 2 &&
                    Math.abs(targetCol - selectedCol) === 2 &&
                    isValidCapture(selectedRow, selectedCol, targetRow, targetCol)
                ) {
                    handleCapture(selectedRow, selectedCol, targetRow, targetCol, square);
                } 

                else {
                    debugInfo("Invalid move.");
                    clearSelection();
                }
            }
        } else if (gameMode === 'online') {

            if (selectedPiece.classList.contains("queen")) {
                if (
                    square.classList.contains("black-square") &&
                    selectedPiece.classList.contains(`${yourColor}-piece`) &&
                    isValidQueenMove(selectedRow, selectedCol, targetRow, targetCol) &&
                    !isValidQueenCapture(selectedRow, selectedCol, targetRow, targetCol) &&
                    !square.hasChildNodes()
                ) {
                    movePieceSocket(selectedRow, selectedCol, targetRow, targetCol);
                    movePiece(square, true);
                } 

                else if (
                    isValidQueenCapture(selectedRow, selectedCol, targetRow, targetCol) &&
                    selectedPiece.classList.contains(`${yourColor}-piece`)
                ) {
                    movePieceSocket(selectedRow, selectedCol, targetRow, targetCol);
                    handleCapture(selectedRow, selectedCol, targetRow, targetCol, square);
                } 

                else {
                    debugInfo("Invalid move.");
                    clearSelection();
                }
            } else {

                if (
                    square.classList.contains("black-square") &&
                    selectedPiece.classList.contains("white-piece") &&
                    selectedPiece.classList.contains(`${yourColor}-piece`) &&
                    targetRow - selectedRow === -1 &&
                    Math.abs(targetCol - selectedCol) === 1 &&
                    !square.hasChildNodes()
                ) {
                    movePieceSocket(selectedRow, selectedCol, targetRow, targetCol);
                    movePiece(square, true);
                } else if (
                    square.classList.contains("black-square") &&
                    selectedPiece.classList.contains("black-piece") &&
                    selectedPiece.classList.contains(`${yourColor}-piece`) &&
                    targetRow - selectedRow === 1 &&
                    Math.abs(targetCol - selectedCol) === 1 &&
                    !square.hasChildNodes()
                ) {
                    movePieceSocket(selectedRow, selectedCol, targetRow, targetCol);
                    movePiece(square, true);
                } 

                else if (
                    selectedPiece.classList.contains(`${yourColor}-piece`) &&
                    Math.abs(targetRow - selectedRow) === 2 &&
                    Math.abs(targetCol - selectedCol) === 2 &&
                    isValidCapture(selectedRow, selectedCol, targetRow, targetCol)
                ) {
                    movePieceSocket(selectedRow, selectedCol, targetRow, targetCol);
                    handleCapture(selectedRow, selectedCol, targetRow, targetCol, square);
                } 

                else {
                    debugInfo("Invalid move.");
                    clearSelection();
                }
            }
        }
    }

    else {
        const selectedRow = parseInt(selectedPiece.parentElement.dataset.row);
        const selectedCol = parseInt(selectedPiece.parentElement.dataset.col);
        const targetRow = parseInt(square.dataset.row);
        const targetCol = parseInt(square.dataset.col);

        debugInfo(`Attempting move. Selected: (${selectedRow}, ${selectedCol}), Target: (${targetRow}, ${targetCol})`);


        if (hasMandatoryCapture() && !isValidCapture(selectedRow, selectedCol, targetRow, targetCol)
            && !isValidQueenCapture(selectedRow, selectedCol, targetRow, targetCol)) {
            debugInfo("You must capture a piece if possible!");
            return;
        }

        if (
            square.classList.contains("black-square") &&
            !square.hasChildNodes()
        ) {
            movePiece(square, true);
        } 
        else {
            debugInfo("Invalid move.");
            clearSelection();
        }
    }
}

function handleOpponentMove(fromRow, fromCol, toRow, toCol) {
    const square = document.querySelector(`[data-row='${fromRow}'][data-col='${fromCol}']`);
    const squareTo = document.querySelector(`[data-row='${toRow}'][data-col='${toCol}']`);
    const piece = square ? square.querySelector(".white-piece, .black-piece") : null;


    if (!piece) {
        console.error("Invalid move: No piece at the source square.");
        return;
    }

    debugInfo(`Opponent move: (${fromRow}, ${fromCol}) -> (${toRow}, ${toCol})`);

    if (piece && piece.classList.contains(`${currentPlayer}-piece`)) {
        if (selectedPiece) selectedPiece.classList.remove("selected");
        selectedPiece = piece;
        selectedPiece.classList.add("selected");
        debugInfo(`${currentPlayer} player selected a piece.`);
    }

    if (selectedPiece.classList.contains("queen")) {

        if (
            squareTo.classList.contains("black-square") &&
            isValidQueenMove(fromRow, fromCol, toRow, toCol) &&
            !isValidQueenCapture(fromRow, fromCol, toRow, toCol) &&
            !squareTo.hasChildNodes()
        ) {
            movePiece(squareTo, true); 
        } 

        else if (isValidQueenCapture(fromRow, fromCol, toRow, toCol)) {
            handleCapture(fromRow, fromCol, toRow, toCol, squareTo); 
        } else {
            debugInfo("Invalid move.");
            clearSelection(); 
        }
    } else {

        if (
            squareTo.classList.contains("black-square") &&
            Math.abs(toRow - fromRow) === 1 &&
            Math.abs(toCol - fromCol) === 1 &&
            !squareTo.hasChildNodes()
        ) {
            movePiece(squareTo, true); 
        } 

        else if (
            Math.abs(toRow - fromRow) === 2 &&
            Math.abs(toCol - fromCol) === 2 &&
            isValidCapture(fromRow, fromCol, toRow, toCol)
        ) {
            handleCapture(fromRow, fromCol, toRow, toCol, squareTo); 
        } else {
            debugInfo("Invalid move.");
            clearSelection(); 
        }
    }
}

function isValidQueenMove(selectedRow, selectedCol, targetRow, targetCol) {
    const rowDiff = Math.abs(targetRow - selectedRow);
    const colDiff = Math.abs(targetCol - selectedCol);
    return rowDiff === colDiff || targetRow === selectedRow || targetCol === selectedCol;
}

function isValidQueenCapture(selectedRow, selectedCol, targetRow, targetCol) {
    debugInfo(`Checking Queen capture from (${selectedRow}, ${selectedCol}) to (${targetRow}, ${targetCol})`);
    const rowDiff = targetRow - selectedRow;
    const colDiff = targetCol - selectedCol;
    if (Math.abs(rowDiff) !== Math.abs(colDiff)) return false; 
    

    const rowDirection = rowDiff > 0 ? 1 : -1;
    const colDirection = colDiff > 0 ? 1 : -1;
    let currentRow = selectedRow + rowDirection;
    let currentCol = selectedCol + colDirection;
    let capturedPiece = null, middleSquare = null;

    while (currentRow !== targetRow && currentCol !== targetCol) {
        const currentSquare = document.querySelector(`[data-row='${currentRow}'][data-col='${currentCol}']`);
        const currentPiece = currentSquare?.querySelector(".white-piece, .black-piece");
        if (currentPiece) {
            if (capturedPiece) return false; 
            capturedPiece = currentPiece;
            middleSquare = currentSquare;
        }
        currentRow += rowDirection;
        currentCol += colDirection;
    }
    
    const targetSquare = document.querySelector(`[data-row='${targetRow}'][data-col='${targetCol}']`);
    if (capturedPiece && targetSquare && !targetSquare.querySelector(".white-piece, .black-piece")) {
        return true; 
    }
    return false; 
}

function captureQueenPiece(capturedPiece) {
    capturedPiece.remove(); 
    if (capturedPiece.classList.contains("white-piece")) {
        blackCapturedPieces++; 
        debugInfo(`Black player captured a white piece. Total captured: ${blackCapturedPieces}`);
    } else if (capturedPiece.classList.contains("black-piece")) {
        whiteCapturedPieces++; 
        debugInfo(`White player captured a black piece. Total captured: ${whiteCapturedPieces}`);
    }
    checkWinner(); 
}

function movePiece(targetSquare, switchTurn = true) {
    debugInfo(`Moving piece to square: ${targetSquare.dataset.row}, ${targetSquare.dataset.col}`);
    targetSquare.appendChild(selectedPiece); 
    selectedPiece.classList.remove("selected");

    const targetRow = parseInt(targetSquare.dataset.row);
    if (
        (currentPlayer === "white" && targetRow === 1) ||
        (currentPlayer === "black" && targetRow === 8)
    ) {
        selectedPiece.classList.add("queen"); 
        debugInfo(`${currentPlayer} piece became a queen!`);
    }

    selectedPiece = null;
    if (switchTurn) switchPlayer(); 
}

function handleCapture(selectedRow, selectedCol, targetRow, targetCol, targetSquare) {
    if (!selectedPiece.classList.contains("queen")) {
        const middleRow = (selectedRow + targetRow) / 2;
        const middleCol = (selectedCol + targetCol) / 2;
        const middleSquare = document.querySelector(`[data-row='${middleRow}'][data-col='${middleCol}']`);
        const capturedPiece = middleSquare ? middleSquare.querySelector(".white-piece, .black-piece") : null;
        const wasQueen = capturedPiece.classList.contains("queen");

        if (capturedPiece) {
            if (capturedPiece.classList.contains("white-piece")) {
                capturedData = { row: middleRow, col: middleCol, player: "white", wasQueen: wasQueen }; 
            } else {
                capturedData = { row: middleRow, col: middleCol, player: "black", wasQueen: wasQueen }; 
            }
        }

        debugInfo(`Attempting capture. Middle square: (${middleRow}, ${middleCol}), Captured piece: ${capturedPiece}`);

        if (capturedPiece && capturedPiece.classList.contains(`${currentPlayer === "white" ? "black" : "white"}-piece`)) {
            saveTurnData(selectedRow, selectedCol, targetRow, targetCol, 'capture', capturedData);

            capturePiece(capturedPiece); 
            movePiece(targetSquare, false); 

            if (!hasMoreCaptures(targetSquare)) {
                switchPlayer();
            } else {
                debugInfo(`${currentPlayer} can capture again.`);
                selectedPiece = targetSquare.querySelector(".white-piece, .black-piece");
                selectedPiece.classList.add("selected"); 
            }
        } else {
            debugInfo("Invalid capture attempt.");
            clearSelection(); 
        }
    } else {

        let rowDirection = targetRow > selectedRow ? 1 : -1;
        let colDirection = targetCol > selectedCol ? 1 : -1;
        let row = selectedRow + rowDirection;
        let col = selectedCol + colDirection;
        let capturedPiece = null;
        let middleSquare = null;
    

        while (row !== targetRow || col !== targetCol) {
            middleSquare = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
            if (middleSquare && middleSquare.hasChildNodes()) {
                capturedPiece = middleSquare.querySelector(".white-piece, .black-piece");
                const wasQueen = capturedPiece.classList.contains("queen");

                if (capturedPiece) {
                    if (capturedPiece.classList.contains("white-piece")) {
                        capturedData = { row: row, col: col, player: "white", wasQueen: wasQueen }; 
                    } else {
                        capturedData = { row: row, col: col, player: "black", wasQueen: wasQueen }; 
                    }
                    break;
                }
            }
            row += rowDirection;
            col += colDirection;
        }
    
        if (capturedPiece && capturedPiece.classList.contains(`${currentPlayer === "white" ? "black" : "white"}-piece`)) {
            saveTurnData(selectedRow, selectedCol, targetRow, targetCol, 'capture', capturedData);
            
            captureQueenPiece(capturedPiece); 
            movePiece(targetSquare, false); 

            if (!hasMoreCapturesQueen(targetSquare)) {
                switchPlayer();
            } else {
                debugInfo(`${currentPlayer} can capture again.`);
                selectedPiece = targetSquare.querySelector(".white-piece, .black-piece");
                selectedPiece.classList.add("selected");
            }
            
        } else {
            debugInfo("Invalid queen capture attempt.");
            clearSelection(); 
        }
    }
}

function isValidCapture(selectedRow, selectedCol, targetRow, targetCol) {
    debugInfo(`Starting isValidCapture function for selected square: (${selectedRow}, ${selectedCol}) and target square: (${targetRow}, ${targetCol})`);

    const middleRow = Math.floor((selectedRow + targetRow) / 2);
    const middleCol = Math.floor((selectedCol + targetCol) / 2);
    debugInfo(`Calculated middle square: (${middleRow}, ${middleCol})`);

    const middleSquare = document.querySelector(`[data-row='${middleRow}'][data-col='${middleCol}']`);
    
    if (!middleSquare) {
        debugInfo("Middle square not found. Invalid capture.");
        return false;
    }

    debugInfo("Middle square found.");

    const capturedPiece = middleSquare.querySelector(".white-piece, .black-piece");
    
    if (capturedPiece) {
        debugInfo("Captured piece found:", capturedPiece);
    } else {
        debugInfo("No captured piece found in the middle square.");
    }

    const opponentPiece = capturedPiece && capturedPiece.classList.contains(`${currentPlayer === "white" ? "black" : "white"}-piece`);
    
    if (opponentPiece) {
        debugInfo("Captured piece belongs to the opponent.");
    } else {
        debugInfo("Captured piece does not belong to the opponent or no piece to capture.");
    }

    return opponentPiece;
}

function debugInfo(message) {
    console.log(`DEBUG INFO: ${message}`);
}

function hasMoreCaptures(pieceSquare) {
    const row = parseInt(pieceSquare.dataset.row);
    const col = parseInt(pieceSquare.dataset.col);
    
    if (isNaN(row) || isNaN(col)) {
        console.error("Invalid row or column value:", row, col);
        return false;
    }

    const directions = [
        { row: -2, col: -2 }, { row: -2, col: 2 }, 
        { row: 2, col: -2 }, { row: 2, col: 2 }
    ];

    return directions.some(({ row: dr, col: dc }) => {
        const midRow = row + dr / 2;
        const midCol = col + dc / 2;
        const targetRow = row + dr;
        const targetCol = col + dc;

        const midSquare = document.querySelector(`[data-row='${midRow}'][data-col='${midCol}']`);
        const targetSquare = document.querySelector(`[data-row='${targetRow}'][data-col='${targetCol}']`);

        if (!midSquare || !targetSquare) return false; 

        const midPiece = midSquare.querySelector(".white-piece, .black-piece");
        if (!midPiece) return false; 

        if (!midPiece.classList.contains(currentPlayer === "white" ? "black-piece" : "white-piece")) return false; 

        return targetSquare.children.length === 0; 
    });
}

function hasMoreCapturesQueen(pieceSquare) {
    const row = parseInt(pieceSquare.dataset.row);
    const col = parseInt(pieceSquare.dataset.col);
    
    if (isNaN(row) || isNaN(col)) {
        console.error("Invalid row or column value:", row, col);
        return false;
    }

    const directions = [
        { row: -1, col: -1 }, { row: -1, col: 1 }, 
        { row: 1, col: -1 }, { row: 1, col: 1 }
    ];

    return directions.some(({ row: dr, col: dc }) => {
        let step = 1;
        let foundOpponent = false; 

        while (true) {
            const midRow = row + dr * step;
            const midCol = col + dc * step;
            const targetRow = row + dr * (step + 1);
            const targetCol = col + dc * (step + 1);

            if (midRow < 1 || midRow > 8 || midCol < 1 || midCol > 8) break;
            if (targetRow < 1 || targetRow > 8 || targetCol < 1 || targetCol > 8) break;

            const midSquare = document.querySelector(`[data-row='${midRow}'][data-col='${midCol}']`);
            const targetSquare = document.querySelector(`[data-row='${targetRow}'][data-col='${targetCol}']`);

            if (!midSquare || !targetSquare) break; 

            const midPiece = midSquare.querySelector(".white-piece, .black-piece");

            if (midPiece) {
                if (foundOpponent) break;

                if (midPiece.classList.contains(currentPlayer === "white" ? "black-piece" : "white-piece")) {
                    foundOpponent = true; 
                } else {
                    break; 
                }
            }

            if (foundOpponent && targetSquare.children.length === 0) return true;

            step++;
        }
        return false;
    });
}

function switchPlayer() {
    currentPlayer = currentPlayer === "white" ? "black" : "white";
    debugInfo(`Next player: ${currentPlayer}`);
}

function clearSelection() {
    if (selectedPiece) selectedPiece.classList.remove("selected");
    selectedPiece = null;
}

function resetGame(color = "white",boardLocation = "offlineGameBoard") {
    whiteCapturedPieces = 0;
    blackCapturedPieces = 0;
    turnCount = 0;
    turnData = [];
    selectedPiece = null;
    currentPlayer = "white";
    debugInfo("Game reset.");
    document.getElementById("offlineGameBoard").innerHTML = "";
    document.getElementById("onlineGameBoard").innerHTML = "";
    createBoard(color,boardLocation);
    addSquareEventListeners();
}

function addSquareEventListeners() {
    document.querySelectorAll(".square").forEach(square => {
        square.addEventListener("click", handleSquareClick);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    addSquareEventListeners();
});
