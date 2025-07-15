document.addEventListener("DOMContentLoaded", function () {
    const pages = ["menu", "offlineMenu", "onlineMenu", "quickMatchMenu", "gameListMenu", "createGameMenu"
    , "settingsMenu", "offlineGameContainer", "onlineGameContainer", "waitingScreen", "waitingScreenForAuth", "loginMenu", "signupMenu"
    , "sendCodeMenu", "verifyMenuForRefreshPassword", "refreshPasswordMenu", "verifyMenuForSignup", "AccountMenu"];
    
    function navigateTo(page) {
        pages.forEach(p => {
            document.getElementById(`${p}`).style.display = (p === page) ? "block" : "none";
        });
        defoultActions(page);
    }
    function defoultActions(page) {
        if (page === 'gameListMenu' || page === 'quickMatchMenu') {
            refreshGameList(); 
        }
        if (page === 'quickMatchMenu' || page === 'gameListMenu' || page === 'createGameMenu' || page === 'onlineMenu') {
            leaveRoom(); 
        }
        if (page === 'onlineMenu') {
            if(!userDefined){
                alert('Please log in before accessing the online mode.');
                navigateTo('menu');
            }
        }
        if (page === 'offlineGameContainer') {
            document.getElementById('offlineGameContainer').style.display = "flex";
            playTwoPlayer(); 
        }
        if (page === 'onlineGameContainer') {
            document.getElementById('onlineGameContainer').style.display = "flex";
        }

    }

    navigateTo("menu");

    window.navigateTo = navigateTo;
});
