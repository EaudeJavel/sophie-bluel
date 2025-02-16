const API = "http://localhost:5678/api";

document.querySelector(".login_form").addEventListener("click", (event) => {
  event.preventDefault();
  const email = document.querySelector(".email").value;
  const password = document.querySelector(".password").value;
  const errorMessage = document.querySelector(".error_message");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^.{4,}$/;

  if (!emailRegex.test(email)) {
    errorMessage.textContent = "L'email n'est pas valide";
    return;
  }

  if (!passwordRegex.test(password)) {
    errorMessage.textContent =
      "Le mot de passe doit contenir au moins 4 caractères";
    return;
  }

  errorMessage.textContent = "";

  loginUser(email, password).then((data) => {
    if (data) {
      console.log("User logged in:", data);
      window.location.href = "index.html";
    }
  });
});

// btn filtre actif
// verficiationn poids et format dans modal, et prblm icone
// ajout fleche retour modal
// Gestion du render de la gallerie de la modale
// sguerrin549@gmail.com
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
