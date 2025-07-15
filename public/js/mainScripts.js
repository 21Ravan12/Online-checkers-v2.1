let userDefined;
let selectedRoomId; 

function playTwoPlayer() {
    gameMode = 'offline'; 
    resetGame('white'); 
}

async function quickMatch() {
    await getRoomList(); 
    gameMode = 'online'; 

    if (activeRooms.length === 0) {
        alert('Boş oda yok'); 
        return;
    }

    document.getElementById("waitingScreenContent").innerHTML = "Searching for an opponent...";
    navigateTo('waitingScreen');

    for (let i = 0; i < activeRooms.length; i++) {
        selectedRoomId = activeRooms[i]['roomId']; 

        console.log("Odaya bağlanmaya çalışılıyor, roomId:", selectedRoomId);

        try {
            yourColor = activeRooms[i]['nextColor']; 

            if (joinGame(selectedRoomId, yourColor)) {
                console.log(`Başarıyla ${selectedRoomId} odasına katıldın!`); 
                navigateTo('onlineGameContainer');
                resetGame(yourColor,"onlineGameBoard"); 
                return;
            } else {
                console.log(`joinGame başarısız oldu: roomId=${selectedRoomId}, color=${yourColor}`);
            }
        } catch (error) {
            console.error(`Renk alınırken hata oluştu: ${error}`); 
        }
    }
}

async function startNewGame() {
    gameMode = 'online'; 
    yourColor = document.getElementById("side").value; 
    let roomId = Math.random().toString(36).substr(2, 9); 
    console.log("Seçilen taraf:", yourColor);
    joinGame(roomId, yourColor);
    document.getElementById("waitingScreenContent").innerHTML = "Waiting for opponent...";
    navigateTo('waitingScreen');
    await gameStarted();
    navigateTo('onlineGameContainer');
    resetGame(yourColor,"onlineGameBoard"); 
}

async function finishGame(winner) {
    document.getElementById("onlineGameContainer").style.opacity = "0.1";
    document.getElementById("afterEndOfOnlineGameContainer").style.display = "block";

    document.getElementById("afterEndOfOnlineGameMessage").innerText = `Game Over! ${winner} player wins.`;
}

async function joinGameFromList() {
    gameMode = 'online'; 
    let roomId = selectedRoomId; 
    if (roomId) {
    console.log("Seçilen taraf:", yourColor);
    joinGame(roomId, yourColor); 
    document.getElementById("waitingScreenContent").innerHTML = "Preparing the game...";
    navigateTo('waitingScreen');
    await gameStarted();
    navigateTo('onlineGameContainer');
    resetGame(yourColor,"onlineGameBoard"); 
    }
}

function adjustSound() {
    alert("Ses ayarları açılıyor!"); 
}

function adjustGraphics() {
    alert("Grafik ayarları açılıyor!"); 
}

function refreshGameList() {
    getRoomList(); 
}

function updateGameListUI() {
    const gameListContainer = document.getElementById("gameListContainer");
    gameListContainer.innerHTML = ""; 

    activeRooms.forEach(room => {
        const roomDiv = document.createElement("div");
        roomDiv.classList.add("game-room"); 
        roomDiv.textContent = room['roomId']; 

        roomDiv.addEventListener("click", () => selectFromList(room['roomId'], roomDiv));

        gameListContainer.appendChild(roomDiv);
    });
}

function updateGameHistoryListUI(data) {
    const gameHistoryListContainer = document.getElementById("gameHistoryListContainer");
    gameHistoryListContainer.innerHTML = "";

    const fragment = document.createDocumentFragment();

    data.forEach(({ gameData, date, owner, whitePlayer, winner }) => {
        const roomDiv = document.createElement("div");
        roomDiv.classList.add("game-history-room");

        const openButton = document.createElement("button");
        openButton.textContent = "►";
        openButton.classList.add("open-game-history-button");
        openButton.addEventListener("click", () => openGameFromHistory(gameData, date, owner, whitePlayer, winner));

        const dateSpan = document.createElement("span");
        dateSpan.textContent = date;

        const resultDot = document.createElement("div");
        resultDot.classList.add("result-dot");
        resultDot.classList.add(owner === winner ? "win" : "lose");

        roomDiv.appendChild(openButton);
        roomDiv.appendChild(dateSpan);
        roomDiv.appendChild(resultDot);
        fragment.appendChild(roomDiv);
    });

    gameHistoryListContainer.appendChild(fragment);
}

function selectFromList(roomId, roomElement) {
    document.querySelectorAll(".game-room").forEach(div => {
        div.classList.remove("selected-room");
    });

    selectedRoomId = roomId;
    getColor(); 
    roomElement.classList.add("selected-room"); 

    console.log(`Seçilen oda: ${selectedRoomId}`);
}

function updateOpponentProfile(profilePicture, userName) {
    const opponentNameElement = document.getElementById("opponentName");
    if (opponentNameElement) {
        opponentNameElement.textContent = userName; 
    }

    const opponentAvatarElement = document.getElementById("opponentAvatar");
    if (opponentAvatarElement && profilePicture) {
        opponentAvatarElement.src = `data:image/jpeg;base64,${profilePicture}`; 
    }
}

function updateAccountUI(profilePicture, userName, email, birthyear) {
    userDefined = true
    const nameElement = document.getElementById("accountName");
    const profileNameElement = document.getElementById("accountProfileName");
    const emailElement = document.getElementById("accountProfileEmail");
    const birthyearElement = document.getElementById("accountProfileBirthyear");

    if (userName !== '') {
        nameElement.textContent = userName; 
        nameElement.style.marginLeft = '20px';
    } else {
        nameElement.textContent = 'Account'; 
        nameElement.style.marginLeft = '0px';
    }
    
    profileNameElement.textContent = 'Name: ' + userName;
    birthyearElement.textContent = 'Birthyear: ' + birthyear;
    emailElement.textContent = 'Email: ' + email;

    const avatarElement = document.getElementById("accountProfilePicture");
    if (avatarElement && profilePicture !== '') {
        avatarElement.style.display = 'block';
        avatarElement.src = `data:image/jpeg;base64,${profilePicture}`; 
    } else {
        avatarElement.style.display = 'none';
        avatarElement.src = ''
    }

    const AccountMenu = document.getElementById("AccountMenuButtonId");
    if (AccountMenu && userName !== '' && email !== '' && birthyear !== '') {
        AccountMenu.onclick = function () { navigateTo('PersonalAccountMenu');};
    } else {
        AccountMenu.onclick = function () { navigateTo('AccountMenu');};
    }

}

function openGameFromHistory(gameData, date, owner, whitePlayer, winner) {
    if (!gameData) {
        alert("No game data found.");
        return;
    }

    const parsedGameData = JSON.parse(gameData);
    console.log("Parsed Game Data:", parsedGameData);

    resetGame(owner === winner ? 'white' : 'black', 'reviewGameBoard', parsedGameData); 

    navigateTo('reviewGameContainer');

}
