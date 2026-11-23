document.addEventListener("DOMContentLoaded", () => {
  // =====================================
  // ACCOUNT
  // =====================================

  function getCurrentAccount() {
    try {
      const session = JSON.parse(
        localStorage.getItem("unseenSession") || "null",
      );

      if (!session || !session.email) return null;

      const accounts = JSON.parse(
        localStorage.getItem("unseenAccounts") || "{}",
      );

      return accounts[session.email] || null;
    } catch (error) {
      console.error("Account loading error:", error);
      return null;
    }
  }

  const account = getCurrentAccount();
  const profile = account?.profile || {};

  const displayName = profile.displayName || account?.name || "Reader";

  const avatar = profile.avatar || "";

  document.getElementById("welcomeName").textContent = displayName;

  function renderAvatar(element, fallback) {
    if (!element) return;

    element.innerHTML = "";

    if (avatar) {
      const image = document.createElement("img");
      image.src = avatar;
      image.alt = "Profile picture";
      element.appendChild(image);
    } else {
      const letter = document.createElement("span");
      letter.textContent = fallback;
      element.appendChild(letter);
    }
  }

  renderAvatar(
    document.getElementById("topProfileButton"),
    displayName.charAt(0).toUpperCase(),
  );

  // =====================================
  // TOAST
  // =====================================

  const toast = document.getElementById("homepageToast");
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2600);
  }

  // =====================================
  // FEATURED STORIES
  // =====================================

  const featuredStories = [
    {
      title: "THE<br>UNSEEN",
      overline: "THE",
      description:
        "A world where stories never end...<br>and secrets never die.",
      image: "../assets/images/hero-background.jpeg",
    },
    {
      title: "MIDNIGHT<br>MESSAGES",
      overline: "A STORY OF SECRETS",
      description:
        "One message can change everything. Some secrets are better left unread.",
      image:
        "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=90",
    },
    {
      title: "THE LOST<br>KINGDOM",
      overline: "A FORGOTTEN WORLD",
      description:
        "Beyond the mountains lies a kingdom that was never meant to be found.",
      image:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1800&q=90",
    },
    {
      title: "THE LAST<br>SUMMER",
      overline: "SOME MEMORIES REMAIN",
      description:
        "A summer, a promise, and a goodbye that changed two lives forever.",
      image:
        "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=90",
    },
  ];

  let featuredIndex = 0;

  const featuredImage = document.getElementById("featuredImage");
  const featuredTitle = document.getElementById("featuredTitle");
  const featuredOverline = document.querySelector(".featured-overline");
  const featuredDescription = document.getElementById("featuredDescription");
  const featuredDots = document.querySelectorAll(".featured-dot");

  function showFeatured(index) {
    featuredIndex = (index + featuredStories.length) % featuredStories.length;

    const story = featuredStories[featuredIndex];

    featuredTitle.innerHTML = story.title;
    featuredOverline.textContent = story.overline;
    featuredDescription.innerHTML = story.description;

    featuredImage.style.backgroundImage = `url("${story.image}")`;

    featuredDots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === featuredIndex);
    });
  }

  document.getElementById("nextFeatured").addEventListener("click", () => {
    showFeatured(featuredIndex + 1);
  });

  document.getElementById("previousFeatured").addEventListener("click", () => {
    showFeatured(featuredIndex - 1);
  });

  featuredDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showFeatured(Number(dot.dataset.slide));
    });
  });

  showFeatured(0);

  // =====================================
  // SEARCH
  // =====================================

  const searchInput = document.getElementById("storySearch");
  const storyItems = document.querySelectorAll(".story-item");

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    storyItems.forEach((item) => {
      const text = (item.dataset.search || item.textContent).toLowerCase();

      item.classList.toggle("search-hidden", !text.includes(query));
    });
  });

  // =====================================
  // MOBILE NAVIGATION
  // =====================================

  const mobileMenuButton = document.getElementById("mobileMenuButton");

  const mainNav = document.getElementById("mainNav");

  mobileMenuButton.addEventListener("click", () => {
    mainNav.classList.toggle("open");

    const isOpen = mainNav.classList.contains("open");

    mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-link").forEach((item) => {
        item.classList.remove("active");
      });

      link.classList.add("active");
      mainNav.classList.remove("open");
      mobileMenuButton.setAttribute("aria-expanded", "false");
    });
  });

  // =====================================
  // FEATURE BUTTONS
  // =====================================

  document
    .getElementById("readFeaturedButton")
    .addEventListener("click", () => {
      showToast("The story reader is coming soon.");
    });

  document
    .getElementById("detailsFeaturedButton")
    .addEventListener("click", () => {
      showToast("Story details are coming soon.");
    });

  document
    .getElementById("saveFeaturedButton")
    .addEventListener("click", () => {
      showToast("Library saving will be connected soon.");
    });

  document.querySelectorAll(".story-action").forEach((button) => {
    button.addEventListener("click", () => {
      showToast("Continue reading will be available soon.");
    });
  });

  document.querySelectorAll(".bookmark-button").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("saved");
      button.textContent = button.classList.contains("saved") ? "♥" : "♧";

      showToast(
        button.classList.contains("saved")
          ? "Story added to your saved list."
          : "Story removed from your saved list.",
      );
    });
  });

  // =====================================
  // GENRES
  // =====================================

  document.querySelectorAll(".genre-card").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".genre-card").forEach((item) => {
        item.classList.remove("selected");
      });

      button.classList.add("selected");

      showToast(`${button.dataset.genre} stories will be available soon.`);
    });
  });

  // =====================================
  // FOLLOW CREATOR
  // =====================================

  document.querySelectorAll(".follow-button").forEach((button) => {
    button.addEventListener("click", () => {
      const following = button.classList.toggle("following");

      button.textContent = following ? "Following" : "Follow";

      showToast(
        following
          ? "You are now following NightWriter."
          : "You unfollowed NightWriter.",
      );
    });
  });

  // =====================================
  // FEATURE CARDS
  // =====================================

  document.querySelectorAll("[data-toast]").forEach((button) => {
    button.addEventListener("click", () => {
      showToast(button.dataset.toast);
    });
  });

  // =====================================
  // NOTIFICATIONS
  // =====================================

  document
    .getElementById("notificationButton")
    .addEventListener("click", () => {
      showToast("Your notifications will appear here.");
    });

  // =====================================
  // MUSIC PLAYER
  // =====================================

  const music = document.getElementById("homepageMusic");

  const playButton = document.getElementById("musicPlayButton");
  const seek = document.getElementById("musicSeek");
  const currentTimeLabel = document.getElementById("musicCurrentTime");
  const durationLabel = document.getElementById("musicDuration");
  const muteButton = document.getElementById("musicMuteButton");
  const volume = document.getElementById("musicVolume");

  music.volume = Number(volume.value);

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  function updateMusicPlayer() {
    const playing = !music.paused;

    playButton.textContent = playing ? "Ⅱ" : "▶";

    playButton.setAttribute(
      "aria-label",
      playing ? "Pause music" : "Play music",
    );

    muteButton.textContent = music.muted ? "×" : "◖";
  }

  playButton.addEventListener("click", async () => {
    if (music.paused) {
      try {
        await music.play();
      } catch (error) {
        showToast("Your browser blocked playback. Try again.");
      }
    } else {
      music.pause();
    }

    updateMusicPlayer();
  });

  music.addEventListener("loadedmetadata", () => {
    durationLabel.textContent = formatTime(music.duration);
  });

  music.addEventListener("timeupdate", () => {
    if (!music.duration) return;

    seek.value = (music.currentTime / music.duration) * 100;

    currentTimeLabel.textContent = formatTime(music.currentTime);
    durationLabel.textContent = formatTime(music.duration);
  });

  seek.addEventListener("input", () => {
    if (!music.duration) return;

    music.currentTime = (Number(seek.value) / 100) * music.duration;
  });

  volume.addEventListener("input", () => {
    music.volume = Number(volume.value);
    music.muted = music.volume === 0;
    updateMusicPlayer();
  });

  muteButton.addEventListener("click", () => {
    music.muted = !music.muted;
    updateMusicPlayer();
  });

  music.addEventListener("play", updateMusicPlayer);
  music.addEventListener("pause", updateMusicPlayer);

  // Browsers may block autoplay until the user interacts.
  music
    .play()
    .then(() => {
      updateMusicPlayer();
    })
    .catch(() => {
      updateMusicPlayer();
    });

  // There is currently one music track.
  document.getElementById("musicPrevious").addEventListener("click", () => {
    music.currentTime = 0;
    showToast("Beginning of the track.");
  });

  document.getElementById("musicNext").addEventListener("click", () => {
    music.currentTime = 0;
    showToast("There are no other tracks yet.");
  });

  updateMusicPlayer();

  console.log("THE UNSEEN homepage is ready.");
});
