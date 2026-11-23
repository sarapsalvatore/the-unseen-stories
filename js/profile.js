// =========================================
// THE UNSEEN
// PROFILE PAGE
// =========================================

const account = ProfileData.getCurrentAccount();

if (!account || !account.profileCompleted) {
  window.location.href = "../index.html";
} else {
  initializeProfile(account);
}

// =========================================
// INITIALIZE PROFILE
// =========================================

function initializeProfile(account) {
  const profile = account.profile || {};
  const stats = account.stats || {};

  // PROFILE IDENTITY

  document.getElementById("profileDisplayName").textContent =
    profile.displayName || account.name;

  document.getElementById("profileUsername").textContent =
    "@" + (profile.username || "reader");

  document.getElementById("profileBio").textContent =
    profile.bio || "Your story begins here.";

  // AVATAR

  const avatar = document.getElementById("profileAvatar");

  if (profile.avatar) {
    avatar.innerHTML = "";

    const image = document.createElement("img");
    image.src = profile.avatar;
    image.alt = "Profile picture";

    avatar.appendChild(image);
  } else {
    avatar.innerHTML = "<span>?</span>";
  }

  // LOCATION

  const locationElement = document.getElementById("profileLocation");

  if (profile.location) {
    locationElement.textContent = "⌖ " + profile.location;
    locationElement.classList.remove("hidden");
  }

  // WEBSITE

  const websiteElement = document.getElementById("profileWebsite");

  if (profile.website) {
    websiteElement.textContent = profile.website;
    websiteElement.href = profile.website;
    websiteElement.classList.remove("hidden");
  }

  // STATISTICS

  document.getElementById("storiesReadCount").textContent =
    stats.storiesRead || 0;

  document.getElementById("followersCount").textContent = stats.followers || 0;

  document.getElementById("followingCount").textContent = stats.following || 0;

  // ACHIEVEMENTS

  const newlyUnlocked = AchievementSystem.check(account);

  if (newlyUnlocked.length > 0) {
    ProfileData.saveAccount(account);
  }

  renderAchievements(account);

  // BUTTONS

  document.getElementById("editProfileButton").addEventListener("click", () => {
    window.location.href = "profile-setup.html";
  });

  document
    .getElementById("profileSignoutButton")
    .addEventListener("click", () => {
      localStorage.removeItem("unseenSession");
      window.location.href = "../index.html";
    });
}

// =========================================
// RENDER ACHIEVEMENTS
// =========================================

function renderAchievements(account) {
  const grid = document.getElementById("achievementsGrid");
  const achievements = AchievementSystem.getAll(account);

  grid.innerHTML = "";

  const unlockedCount = achievements.filter(
    (achievement) => achievement.unlocked,
  ).length;

  document.getElementById("achievementTotal").textContent =
    `${unlockedCount} / ${achievements.length} UNLOCKED`;

  achievements.forEach((achievement) => {
    const card = document.createElement("article");

    card.className = achievement.unlocked
      ? "achievement-card unlocked"
      : "achievement-card locked";

    const symbol = document.createElement("div");
    symbol.className = "achievement-symbol";
    symbol.textContent = achievement.symbol;

    const status = document.createElement("span");
    status.className = "achievement-status";
    status.textContent = achievement.unlocked ? "UNLOCKED" : "LOCKED";

    const title = document.createElement("h3");
    title.textContent = achievement.name;

    const description = document.createElement("p");
    description.textContent = achievement.description;

    card.appendChild(status);
    card.appendChild(symbol);
    card.appendChild(title);
    card.appendChild(description);

    grid.appendChild(card);
  });
}
