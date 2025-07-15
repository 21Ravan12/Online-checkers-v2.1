let gameMode = 'offline'; 
let yourColor; 
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

function updateAccountUI(profilePicture, userName) {
    const nameElement = document.getElementById("accountName");
    if (nameElement) {
        nameElement.textContent = userName; 
        nameElement.style.marginLeft = '20px';
    }

    const avatarElement = document.getElementById("accountProfilePicture");
    avatarElement.style.display = 'block';
    if (avatarElement && profilePicture) {
        avatarElement.src = `data:image/jpeg;base64,${profilePicture}`; 
    }
}
