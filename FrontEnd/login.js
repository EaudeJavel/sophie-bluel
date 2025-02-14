const API = "http://localhost:5678/api";

document.querySelector(".login_form").addEventListener("click", (event) => {
    event.preventDefault();
    const email = document.querySelector(".email").value;
    const password = document.querySelector(".password").value;

    loginUser(email, password).then((data) => {
        if (data) {
            console.log("User logged in:", data);
            window.location.href = "index.html";
        }
    });
});

async function loginUser(email, password) {
    const url = `${API}/users/login`;
    const data = {
        email: email,
        password: password,
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const res = await response.json();

        // logged
        isLogged = true;
        // store in session storage
        userToken = res.token;
        localStorage.setItem("userToken", userToken);

        // getWorks();
        // getCategories().then((categories) => {
        //   if (categories) {
        //     renderCategories(categories);
        //   }
        // });

        return res;
    } catch (error) {
        console.error("Error logging in:", error);
        return null;
    }
}
