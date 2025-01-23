const API = "http://localhost:5678/api";
// track if logged
let isLogged = false;
// get usertoken
let userToken = localStorage.getItem("userToken");

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.querySelector(".modal");
  const editProjects = document.querySelector(".edit-projects");
  const closeBtn = document.querySelector(".modal .close");
  const addPhoto = document.querySelector(".modal-btn");
  const addPhotoSection = document.querySelector(".add-photo-content");
  const modalGalleryContainer = document.querySelector(
    ".modal-gallery-container"
  );
  const photoInput = document.querySelector("#photoInput");
  const imagePreview = document.querySelector("#imagePreview");
  const photoInfo = document.querySelector("#photoInfo");
  const inputButtons = document.querySelector(".input-button");
  const submitButton = document.querySelector("#submitPhoto");
  const titleInput = document.querySelector("#title");
  const categorySelect = document.querySelector("#category");
  const modeEditionBanner = document.querySelector(".mode-edition");
  const filtersSection = document.querySelector(".filters");

  // check if logged
  if (userToken) {
    isLogged = true;
  }

  getCategories();
  getWorks();

  function updateUIForLoggedUser() {
    if (isLogged) {
      filtersSection.classList.add("hidden");
      modeEditionBanner.classList.add("visible");
      modeEditionBanner.classList.remove("hidden");
      editProjects.classList.remove("hidden");
      editProjects.classList.add("visible");
      filtersSection.classList.add("hidden");
    } else {
      // modeEditionBanner.classList.add("hidden");
      // modeEditionBanner.classList.remove("visible");
      // editProjects.classList.add("hidden");
      // editProjects.classList.remove("visible");
      // filtersSection.classList.remove("hidden");
    }
  }

  updateUIForLoggedUser();

  // logout
  document.querySelector(".logout")?.addEventListener("click", () => {
    localStorage.removeItem("userToken");
    isLogged = false;
    updateUIForLoggedUser();
  });

  let isImageSelected = false;
  let isTitleFilled = false;
  let isCategorySelected = false;

  function checkFormValidity() {
    if (isImageSelected && isTitleFilled && isCategorySelected) {
      submitButton.classList.add("active");
      submitButton.disabled = false;
    } else {
      submitButton.classList.remove("active");
      submitButton.disabled = true;
    }
  }

  editProjects.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";

    // Reset addPhotoSection and modalGalleryContainer
    addPhotoSection.style.display = "none";
    modalGalleryContainer.style.display = "flex";

    photoInput.value = "";
    imagePreview.style.display = "none";
    inputButtons.style.display = "block";
    photoInfo.style.display = "block";
    titleInput.value = "";
    categorySelect.value = "";
  });

  //if modal clicked and click outside
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      // Reset addPhotoSection and modalGalleryContainer
      addPhotoSection.style.display = "none";
      modalGalleryContainer.style.display = "flex";
    }
  });

  addPhoto.addEventListener("click", () => {
    addPhotoSection.style.display = "flex";
    modalGalleryContainer.style.display = "none";
  });

  photoInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    isImageSelected = !!file;

    if (file) {
      if (file.type.startsWith("image/")) {
        // Create URL
        const imageURL = URL.createObjectURL(file);
        imagePreview.src = imageURL;
        imagePreview.style.display = "block";

        // Hide label and info
        photoInfo.style.display = "none";
        inputButtons.style.display = "none";
      } else {
        imagePreview.style.display = "none";
        photoInfo.style.display = "block";
        inputButtons.style.display = "block";
      }
    } else {
      imagePreview.style.display = "none";
      photoInfo.style.display = "block";
      inputButtons.style.display = "block";
    }

    checkFormValidity(); // Always call this after updating isImageSelected
  });

  titleInput.addEventListener("input", (event) => {
    isTitleFilled = !!event.target.value.trim();
    checkFormValidity();
  });

  categorySelect.addEventListener("change", (event) => {
    isCategorySelected = !!event.target.value;
    checkFormValidity();
  });

  submitButton.addEventListener("click", async () => {
    if (!isImageSelected || !isTitleFilled || !isCategorySelected) return;

    const file = photoInput.files[0];
    const title = titleInput.value;
    const category = categorySelect.value;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);
    formData.append("category", category);

    try {
      const response = await fetch(`${API}/works`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      // refetch works
      getWorks();

      // reset
      photoInput.value = "";
      titleInput.value = "";
      categorySelect.value = "";
      document.querySelector(".modal").style.display = "none";
    } catch (error) {
      console.error("Erreur lors de l'envoi des données :", error);
    }
  });
});

// get works
async function getWorks() {
  const url = `${API}/works`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        // use token for security reasons
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const res = await response.json();

    if (res) {
      renderWorks(res);
    }

    return res;
  } catch (error) {
    console.error("error fetching works:", error);
    return null;
  }
}

// get work categories
async function getCategories() {
  const url = `${API}/categories`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const res = await response.json();
    if (res) {
      renderCategories(res);
    }
    return res;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return null;
  }
}

async function deleteProject(projectId) {
  const url = `${API}/works/${projectId}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete project with ID ${projectId}. Status: ${response.status}`
      );
    }

    getWorks();
  } catch (error) {
    console.error("Error deleting project:", error);
  }
}

// render works as galleries
function renderWorks(works) {
  const galleries = document.querySelectorAll(".gallery");

  galleries.forEach((gallery, index) => {
    // avoid repetitions
    gallery.innerHTML = "";

    // loop on works
    works.forEach((work) => {
      const figure = document.createElement("figure");

      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title;
      figure.appendChild(img);

      if (index === 0) {
        // gallery in home
        const figcaption = document.createElement("figcaption");
        figcaption.textContent = work.title;
        figure.appendChild(figcaption);
      } else if (index === 1) {
        // gallery in modal
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.addEventListener("click", () => {
          deleteProject(work.id);
        });
        const trashImg = document.createElement("img");
        trashImg.src = "./assets/icons/trash.png";
        trashImg.alt = "delete";
        trashImg.style.width = "12px";
        trashImg.style.height = "12px";

        deleteButton.appendChild(trashImg);
        figure.appendChild(deleteButton);
      }

      gallery.appendChild(figure);
    });
  });
}

function renderEditCategories() {
  const filters = document.querySelector(".filters");

  const button = document.createElement("button");
  button.textContent = "modifier";
  button.addEventListener("click", () => {
    console.log("prout");
  });
  filters.appendChild(button);
}

function renderCategories(categories) {
  const filter = document.querySelector(".filters");
  const select = document.querySelector("#category");
  const defaultOption = document.createElement("option");

  filter.innerHTML = "";
  select.innerHTML = "";

  if (!userToken) {
    const allButton = document.createElement("button");

    allButton.textContent = "Tous";
    // set data attribute to 0 - bad usage in prod because 0 could bbe a category
    allButton.setAttribute("data-category-id", 0);
    allButton.addEventListener("click", () => {
      getWorks().then((works) => {
        if (works) {
          renderWorks(works);
        }
      });
    });

    filter.appendChild(allButton);
  }
  defaultOption.value = "";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.textContent = "Choisir une catégorie";

  select.appendChild(defaultOption);
  categories.forEach((category) => {
    const button = document.createElement("button");
    const option = document.createElement("option");
    button.textContent = category.name;
    // add data attribute to track btn
    button.setAttribute("data-category-id", category.id);
    // add click listener
    button.addEventListener("click", () => {
      filterWorksByCategory(category.id);
    });

    option.value = category.id;
    option.textContent = category.name;

    select.appendChild(option);

    filter.appendChild(button);
  });
}

function filterWorksByCategory(categoryID) {
  getWorks().then((works) => {
    if (works) {
      const filteredWorks = works.filter(
        (work) => work.categoryId === categoryID
      );
      renderWorks(filteredWorks);
    }
  });
}
