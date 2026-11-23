// =========================================
// THE UNSEEN
// PROFILE SETUP
// =========================================

const profileForm = document.getElementById("profileForm");

const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");
const removeAvatar = document.getElementById("removeAvatar");

const displayNameInput = document.getElementById("displayName");
const usernameInput = document.getElementById("username");
const bioInput = document.getElementById("bio");
const locationInput = document.getElementById("location");
const websiteInput = document.getElementById("website");

const bioCount = document.getElementById("bioCount");
const formError = document.getElementById("formError");

let avatarData = "";

// =========================================
// ACCOUNT DATA
// =========================================

function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem("unseenAccounts") || "{}");
  } catch (error) {
    return {};
  }
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem("unseenSession") || "null");
  } catch (error) {
    return null;
  }
}

const session = getSession();
let accounts = getAccounts();

if (!session || !session.email || !accounts[session.email]) {
  window.location.href = "../index.html";
}

const currentAccount = session?.email ? accounts[session.email] : null;

// =========================================
// LOAD EXISTING PROFILE
// =========================================

if (currentAccount) {
  const profile = currentAccount.profile || {};

  displayNameInput.value = profile.displayName || currentAccount.name || "";

  usernameInput.value = profile.username || "";
  bioInput.value = profile.bio || "";
  locationInput.value = profile.location || "";
  websiteInput.value = profile.website || "";

  avatarData = profile.avatar || "";

  if (avatarData) {
    showAvatar(avatarData);
  }

  updateBioCount();
}

// =========================================
// AVATAR
// =========================================

function showAvatar(image) {
  avatarPreview.innerHTML = "";

  const img = document.createElement("img");
  img.src = image;
  img.alt = "Profile picture";

  avatarPreview.appendChild(img);
}

function resetAvatar() {
  avatarData = "";
  avatarPreview.innerHTML = "<span>?</span>";
}

avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    formError.textContent = "Please select an image.";
    avatarInput.value = "";
    return;
  }

  if (file.size > 8 * 1024 * 1024) {
    formError.textContent = "Image must be smaller than 8 MB.";
    avatarInput.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const maxSize = 400;

      let width = image.width;
      let height = image.height;

      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, width, height);

      avatarData = canvas.toDataURL("image/jpeg", 0.75);

      showAvatar(avatarData);
      formError.textContent = "";
    };

    image.onerror = () => {
      formError.textContent = "This image could not be opened.";
    };

    image.src = reader.result;
  };

  reader.readAsDataURL(file);
});

removeAvatar.addEventListener("click", () => {
  resetAvatar();
  avatarInput.value = "";
});

// =========================================
// BIO COUNTER
// =========================================

function updateBioCount() {
  bioCount.textContent = bioInput.value.length;
}

bioInput.addEventListener("input", updateBioCount);

// =========================================
// USERNAME
// =========================================

usernameInput.addEventListener("input", () => {
  usernameInput.value = usernameInput.value
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, "");
});

// =========================================
// SAVE PROFILE
// =========================================

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();

  formError.textContent = "";

  const currentSession = getSession();

  if (!currentSession || !currentSession.email) {
    formError.textContent = "Please sign in again.";
    return;
  }

  accounts = getAccounts();

  const account = accounts[currentSession.email];

  if (!account) {
    formError.textContent = "Account not found. Please sign in again.";
    return;
  }

  const displayName = displayNameInput.value.trim();
  const username = usernameInput.value.trim().toLowerCase();
  const bio = bioInput.value.trim();
  const location = locationInput.value.trim();
  const website = websiteInput.value.trim();

  if (!displayName || !username) {
    formError.textContent = "Please enter your display name and username.";
    return;
  }

  if (username.length < 3) {
    formError.textContent = "Username must contain at least 3 characters.";
    return;
  }

  if (!/^[a-z0-9_.]+$/.test(username)) {
    formError.textContent =
      "Username can only contain letters, numbers, dots and underscores.";
    return;
  }

  const usernameTaken = Object.values(accounts).some((item) => {
    return (
      item.email !== account.email &&
      item.profile?.username?.toLowerCase() === username
    );
  });

  if (usernameTaken) {
    formError.textContent = "This username is already taken.";
    return;
  }

  if (website && !/^https?:\/\//i.test(website)) {
    formError.textContent = "Website must start with https:// or http://";
    return;
  }

  account.profile = {
    displayName,
    username,
    bio,
    location,
    website,
    avatar: avatarData,
  };

  account.profileCompleted = true;

  if (!account.stats) {
    account.stats = {
      storiesRead: 0,
      followers: 0,
      following: 0,
    };
  }

  if (!account.activity) {
    account.activity = {
      readStories: [],
      categoriesExplored: [],
      publishedStories: 0,
    };
  }

  if (!Array.isArray(account.achievements)) {
    account.achievements = [];
  }

  accounts[currentSession.email] = account;

  try {
    localStorage.setItem("unseenAccounts", JSON.stringify(accounts));

    localStorage.setItem(
      "unseenSession",
      JSON.stringify({
        name: account.name,
        email: account.email,
      }),
    );

    window.location.href = "profile.html";
  } catch (error) {
    formError.textContent = "Could not save your profile. Try a smaller photo.";
  }
});
