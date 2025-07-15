document.addEventListener("DOMContentLoaded", function () {
    const pages = ["menu", "offlineMenu", "onlineMenu", "quickMatchMenu", "gameListMenu", "createGameMenu", 
    "settingsMenu", "offlineGameContainer", "onlineGameContainer", "waitingScreen", "waitingScreenForAuth"
    , "loginMenu", "signupMenu", "sendCodeMenu", "verifyMenuForRefreshPassword", "refreshPasswordMenu",
    "verifyMenuForSignup", "AccountMenu", "PersonalAccountMenu", "gameHistoryList", "reviewGameContainer",
    "afterEndOfOnlineGameContainer"];
    
    function navigateTo(page) {
        pages.forEach(p => {
            document.getElementById(`${p}`).style.display = (p === page) ? "block" : "none";
        });
        sessionStorage.setItem("currentPage", page);
        defoultActions(page);
    }
    function defoultActions(page) {
        if (page === 'menu') {
            if (socket && !socket.disconnected) {
                socket.disconnect();
            }            
        }
        if (page === 'gameListMenu' || page === 'quickMatchMenu') {
            refreshGameList(); 
        }
        if (page === 'gameHistoryList') {
            getGameHistoryList(); 
        }
        if (page === 'quickMatchMenu' || page === 'gameListMenu' || page === 'createGameMenu' || page === 'onlineMenu') {
            if (activeRoomId) {
                leaveRoom(); 
            }
        }
        if (page === 'quickMatchMenu' || page === 'gameListMenu' || page === 'createGameMenu') {
            if (!socket || socket.disconnected) {
                alert("Socket is disconnected, initializing..."); 
                navigateTo('onlineMenu');
            }
        }
        if (page === 'onlineMenu') {
            if (!userDefined) {
                alert('Please log in before accessing the online mode.');
                navigateTo('menu');
                return;
            }

            if (!socket || socket.disconnected) {
                initSocket();
            }
        }
        if (page === 'offlineGameContainer') {
            document.getElementById('offlineGameContainer').style.display = "flex";
            playTwoPlayer(); 
        }
        if (page === 'reviewGameContainer') {
            document.getElementById('reviewGameContainer').style.display = "flex";
        }
        if (page === 'onlineGameContainer') {
            document.getElementById('onlineGameContainer').style.display = "flex";
        }

    }
    if (sessionStorage.getItem("currentPage")) {
        navigateTo(sessionStorage.getItem("currentPage"));
    } else {
        navigateTo("menu");
    }

    window.navigateTo = navigateTo;
});
