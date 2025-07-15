const socket = io("http://127.0.0.1:3002");
let activeRooms = [];
let activeRoomId = null;
let opponentId;

function debugInfo(message, data) {
    console.log(`[DEBUG] ${message}:`, data);
}

function gameStarted() {
    return new Promise((resolve) => {
        socket.on("gameStart", () => {
            resolve(true);
        });
    });
}

function joinGame(roomId, color) {
    if (!roomId || !color) {
        console.error("[ERROR] Room ID or color is missing!");
        return;
    }

    activeRoomId = roomId;
    let userId = sessionStorage.getItem("user_id");
    debugInfo("Sending joinRoom event for room", { userId, roomId, color });
    socket.emit("joinRoom", { roomId, color, userId});
    return true;
}

function leaveRoom() {
    socket.emit("leaveRoom");
}

function getRoomList() {
    debugInfo("Requesting room list", {});
    socket.emit("getRooms");
}

function getColor() {
    socket.emit("getColor", selectedRoomId);
}

socket.on("yourColor", (color) => {
    debugInfo("Assigned color", color);
    yourColor = color;
});

socket.on("error", (message) => {
    console.error(`[ERROR] ${message}`);
});

socket.on("move", (move) => {
    if (move && move.from && move.to) {
        debugInfo("Opponent move received", move);
        handleOpponentMove(move.from.row, move.from.col, move.to.row, move.to.col);
    } else {
        console.error("[ERROR] Invalid move data received", move);
    }
});

socket.on("roomsList", (roomInfo) => {
    activeRooms = roomInfo;
    debugInfo("Updated room list", activeRooms);
    updateGameListUI(); 
});

socket.on("gameStart", () => {
    debugInfo("Game started", {})
});

socket.on("opponentLeftRoom", () => {
    debugInfo("Game Over");
    navigateTo('onlineMenu');
});

socket.on("playerJoined", ({ opponentId }) => {
    if (!opponentId) {
        console.error("Error: opponentId is required!");
        return;
    }

    const numericOpponentId = Number(opponentId);

    if (isNaN(numericOpponentId)) {
        console.error(`Error: opponentId (${opponentId}) is not a valid number!`);
        return;
    }

    const opponent = findUser(numericOpponentId);

    if (!opponent) {
        console.error(`Error: Opponent with ID ${numericOpponentId} not found!`);
        return;
    }

    console.log(`Match set: ${numericOpponentId}`);
});




socket.on("playerCount", (count) => {
    debugInfo("Player count updated", count);
});

function movePieceSocket(fromRow, fromCol, toRow, toCol) {
    if (!activeRoomId) {
        console.error("[ERROR] No game room selected!");
        return;
    }
    const moveData = { roomId: activeRoomId, from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol } };
    debugInfo("Sending move data", moveData);
    socket.emit("move", moveData);
}
