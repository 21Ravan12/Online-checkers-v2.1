document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("signupForm").addEventListener("submit", signUp);
    document.getElementById("verificationFormForSignup").addEventListener("submit", verifyCodeForSignup);
    document.getElementById("loginForm").addEventListener("submit", logIn);
    document.getElementById("sendCodeForm").addEventListener("submit", sendVerifyCode);
    document.getElementById("verifyRefreshPasswordForm").addEventListener("submit", verifyMenuForRefreshPassword);
    document.getElementById("refreshPasswordForm").addEventListener("submit", refreshPassword);
});

async function signUp(event) {
    event.preventDefault();

    const name = document.getElementById("signupUsername").value.trim();
    const email = document.getElementById("signupUserEmail").value.trim();
    const birthyear = document.getElementById("signupUserDate").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!name || !email || !birthyear || !password || !confirmPassword) {
        alert("All fields are required!");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    const defaultProfilePicture = "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAAELklEQVR4nO3dS27bMBRA0aToUrOsLEjL6qAF+otjxZIskfeccYE+Au+KhCd5XZblBaq+nT0AnEkApAmANAGQJgDSBECaAEgTAGkCIE0ApAmANAGQJgDSBECaAEgTAGkCIE0ApAmANAGQJgDSBECaAEgTAGkCIE0ApAmANAGQJgDSBECaAEgTAGkCIE0ApAmANAGQJgDSBECaAEgTAGkCIE0ApAmANAGQJgDSBECaAEgTAGkCIO372QO0vL+/r/lnb29vR0/CT6/Lspw9w+RWLv0tYjiUAI6yce//p4QjCGBnu+/9/5SwIwHs5gmr/ycZ7EIAO3jy6v9JBhv5GXSrE7f/9P99Am6Ax11q+VwFj3EDPOhS2/9yvXlGIYBHXHPbrjnVxXkCfc0QS+Y5tJ4b4AuG2P6Xcea8AgGsNdZWjTXtiQSwyoj7NOLMzycA0gRw37if0nEnfxoB3DH6Do0+/9EE8Jk5tmeOUxxEAKQJ4KaZPpwznWVfAvjYfBsz34l2IQDSBPCBWT+Ws55rCwGQJoB/zf2ZnPt0DxAAaQIgTQB/KbwQCmdcTwCkCYA0AfzWeRt0TnqXAEgTAGkCIE0Av9SexbXz3iIA0gRAmgBIEwBpAiBNAKQJgDQBkCYA0gRAmgBIEwBpAvil9oflaue9RQCkCYA0AZAmgN86z+LOSe8SAGkCIE0Afym8DQpnXE8ApAmANAH8a+4Xwtyne4AASBPAB2b9TM56ri0EQJoAPjbfx3K+E+1CADfNtDEznWVfAiBNAJ+Z48M5xykOIoA7Rt+e0ec/mgDuG3eHxp38aQRAmgBWGfFTOuLMzyeAtcbap7GmPZEAvmCUrRplzit4XZbl7BnGc9m/MGf1v8oN8Ihr7tk1p7o4ATzoatt2tXlG4Qm01enPIau/hRtgq3P3z/Zv5AbYzZOvAqu/CwHs7AkZWP0dCeAou5dg748ggMNtLMHeH2rCAE7/WWZukwXpVyDSBECaAEgTAGkCIE0ApAmANAGQJgDSBECaAEgTAGkCIE0ApAmANAGQJgDSBECaAEgTAGkCIE0ApAmANAGQJgDSBECaAEgTAGkCIE0ApAmANAGQJgDSBECaAEgTAGkCIE0ApAmANAGQJgDSBECaAEgTAGkCIE0ApAmANAGQJgDSBECaAEgTAGkCIE0ApAmANAGQJgDSBECaAEgTAGkCIE0ApAmANAGQJgDSBECaAEgTAGkCIE0ApAmANAGQJgDSBEDa67IsZ88Ap3EDkCYA0gRAmgBIEwBpAiBNAKQJgDQBkCYA0gRAmgBIEwBpAiBNAKQJgDQBkCYA0gRAmgBIEwBpAiBNAKQJgDQBkCYA0gRAmgBIEwBpAiBNAKQJgDQBkCYA0n4AQKq0cz+AeSEAAAAASUVORK5CYII=";

    const payload = {
        name,
        email,
        birthyear,  
        password,
        profilePicture: defaultProfilePicture 
    };

    document.getElementById("waitingScreenContentForAuth").innerHTML = "Waiting for send verification code...";
    navigateTo('waitingScreenForAuth');

    try {
        const response = await fetch("http://127.0.0.1:9090/api/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        console.log("Raw Response:", response);

        let data;
        try {
            data = await response.json();
            console.log("Parsed Response:", data);
        } catch (error) {
            console.error("Invalid JSON response:", data, error);
            alert("Invalid response from server: " + data);
            return;
        }

        if (!response.ok) {
            const errorMessage = data?.error || "An error occurred while registering.";
            navigateTo('signupMenu');
            alert(errorMessage);
            console.log(errorMessage);
            return;
        }

        if (data.jwt_token) {
            sessionStorage.setItem("authToken", data.jwt_token);
        }

        if (data.message) {
            alert(data.message);
            navigateTo("verifyMenuForSignup");
        }
    } catch (error) {
        alert("An unexpected error occurred: " + error.message);
        navigateTo('signupMenu');
    }
}

async function verifyCodeForSignup(event) {
    event.preventDefault(); 

    const code = document.getElementById("verificationCodeForSignup").value.trim();
    const token = sessionStorage.getItem("authToken");

    if (!code) {
        alert("All fields are required!");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:9090/api/users/verifyForRegister", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, token })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        if (data.message) {
            alert(data.message);
            navigateTo("loginMenu");
        } 
    } catch (error) {
        alert(error.message);
    }
}

async function logIn(event) {
    event.preventDefault(); 

    const email = document.getElementById("loginUserEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
        alert("All fields are required!");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:9090/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        if (data.jwt_token) {
            sessionStorage.setItem("authToken", data.jwt_token);
        }

        if (data.user_id) {
            sessionStorage.setItem("user_id", data.user_id);
        }

        if (data.message) {
            updateAccountUI(data.profilePicture,data.name)
            alert(data.message);
            navigateTo("menu");
        } 
    } catch (error) {
        alert(error.message);
    }
}

async function sendVerifyCode(event) {
    event.preventDefault();

    const email = document.getElementById("sendCodeEmail").value.trim();

    if (!email) {
        alert("All fields are required!");
        return;
    }

    const payload = {
        email,
    };

    document.getElementById("waitingScreenContentForAuth").innerHTML = "Waiting for send verification code...";
    navigateTo('waitingScreenForAuth');

    try {
        const response = await fetch("http://127.0.0.1:9090/api/users/changeCode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        let data;
        try {
            data = await response.json();
        } catch (error) {
            console.error("Invalid JSON response:", data, error);
            alert("Invalid response from server: " + data);
            return;
        }
    
        if (!response.ok) {
            navigateTo('sendCodeMenu');
            const errorMessage = data?.error || "An error occurred while registering.";
            alert(errorMessage);
            console.log(errorMessage);
            return;
        }
    
        if (data.jwt_token) {
            sessionStorage.setItem("authToken", data.jwt_token);
        }
    
        if (data.message) {
            alert(data.message);
            navigateTo("verifyMenuForRefreshPassword");            
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An unexpected error occurred: " + error.message);
    }
}

async function verifyMenuForRefreshPassword(event) {
    event.preventDefault(); 

    const code = document.getElementById("verificationCodeForRefreshPassword").value.trim();
    const token = sessionStorage.getItem("authToken");

    if (!code) {
        alert("All fields are required!");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:9090/api/users/verifyForChangeCode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, token })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        if (data.message) {
            alert(data.message);
            navigateTo("refreshPasswordMenu");
        } 
    } catch (error) {
        alert(error.message);
    }
}

async function refreshPassword(event) {
    event.preventDefault(); 

    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmNewPassword").value;
    const token = sessionStorage.getItem("authToken");

    if (!password) {
        alert("All fields are required!");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:9090/api/users/changeCodeEnd", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        if (data.message) {
            alert(data.message);
            navigateTo("loginMenu");
        } 
    } catch (error) {
        alert(error.message);
    }
}

async function findUser(id) {
    if (!id) {
        alert("User ID is required!");
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:9090/api/users/search?id=${encodeURIComponent(id)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Something went wrong.");
        }

        const data = await response.json();
        console.log("Response Data:", data);

        if (data && data.name && data.profilePicture) {
            const profilePicture = data.profilePicture;
            const userName = data.name;
            updateOpponentProfile(profilePicture, userName);
        } else {
            alert("User not found.");
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
        console.error("Fetch error:", error);
    }
}


