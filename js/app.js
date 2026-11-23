// =========================================
// THE UNSEEN
// MAIN APPLICATION
// =========================================

const intro = document.getElementById("intro");
const landing = document.getElementById("landing");
const authOverlay = document.getElementById("authOverlay");
const dashboard = document.getElementById("dashboard");

const authForm = document.getElementById("authForm");
const authError = document.getElementById("authError");

let authMode = "signup";

// =========================================
// VINYL MUSIC PLAYER
// =========================================

const backgroundMusic = document.getElementById("backgroundMusic");
const vinylPlayer = document.getElementById("vinylPlayer");
const vinylToggle = document.getElementById("vinylToggle");
const vinylPlayButton = document.getElementById("vinylPlayButton");
const vinylMute = document.getElementById("vinylMute");
const vinylStatus = document.getElementById("vinylStatus");
const musicVolume = document.getElementById("musicVolume");

let userVolume = Number(musicVolume.value) || 0.45;
let isMuted = false;

let audioFadeFrame = null;
let audioFadeToken = 0;

let vinylSpinAnimation = null;
let vinylSpinFrame = null;
let vinylSpinRate = 0;
let vinylSpinToken = 0;

let startRequest = null;
let pauseRequest = false;

backgroundMusic.volume = 0;
backgroundMusic.pause();

function fadeAudioTo(targetVolume, duration = 900, callback = null) {
  cancelAnimationFrame(audioFadeFrame);

  const token = ++audioFadeToken;
  const startVolume = backgroundMusic.volume;
  const startTime = performance.now();

  function step(now) {
    if (token !== audioFadeToken) return;

    const progress = Math.min((now - startTime) / duration, 1);
    const eased = progress * progress * (3 - 2 * progress);

    backgroundMusic.volume = Math.max(
      0,
      Math.min(1, startVolume + (targetVolume - startVolume) * eased),
    );

    if (progress < 1) {
      audioFadeFrame = requestAnimationFrame(step);
    } else {
      backgroundMusic.volume = targetVolume;
      audioFadeFrame = null;

      if (callback) callback();
    }
  }

  audioFadeFrame = requestAnimationFrame(step);
}

function animateVinylSpin(shouldPlay) {
  const token = ++vinylSpinToken;

  cancelAnimationFrame(vinylSpinFrame);

  if (shouldPlay && !vinylSpinAnimation) {
    vinylSpinAnimation = vinylToggle.animate(
      [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
      {
        duration: 4000,
        iterations: Infinity,
        easing: "linear",
      },
    );

    vinylSpinAnimation.pause();
    vinylSpinAnimation.playbackRate = 0.001;
  }

  if (shouldPlay && vinylSpinAnimation) {
    vinylSpinAnimation.play();
  }

  const startRate = vinylSpinRate;
  const targetRate = shouldPlay ? 1 : 0;
  const startTime = performance.now();
  const duration = shouldPlay ? 1200 : 1000;

  function changeSpeed(now) {
    if (token !== vinylSpinToken) return;

    const progress = Math.min((now - startTime) / duration, 1);
    const eased = progress * progress * (3 - 2 * progress);

    vinylSpinRate = startRate + (targetRate - startRate) * eased;

    if (vinylSpinAnimation && vinylSpinRate > 0) {
      vinylSpinAnimation.playbackRate = Math.max(0.001, vinylSpinRate);
    }

    if (progress < 1) {
      vinylSpinFrame = requestAnimationFrame(changeSpeed);
    } else {
      vinylSpinRate = targetRate;

      if (!shouldPlay && vinylSpinAnimation) {
        vinylSpinAnimation.pause();
      }
    }
  }

  vinylSpinFrame = requestAnimationFrame(changeSpeed);
}

function updateMusicPlayer() {
  const playing = !backgroundMusic.paused;

  vinylPlayer.classList.toggle("is-playing", playing);

  vinylToggle.setAttribute(
    "aria-label",
    playing ? "Pause music" : "Play music",
  );

  vinylToggle.title = playing ? "Pause music" : "Play music";
  vinylPlayButton.textContent = playing ? "PAUSE" : "PLAY";
  vinylStatus.textContent = playing ? "NOW PLAYING" : "READY TO PLAY";
  vinylMute.textContent = isMuted ? "UNMUTE" : "MUTE";
}

async function startBackgroundMusic() {
  if (startRequest) return startRequest;

  if (!backgroundMusic.paused) {
    pauseRequest = false;

    fadeAudioTo(isMuted ? 0 : userVolume, 700);
    animateVinylSpin(true);
    updateMusicPlayer();

    return;
  }

  pauseRequest = false;

  startRequest = (async () => {
    try {
      backgroundMusic.volume = 0;

      await backgroundMusic.play();

      fadeAudioTo(isMuted ? 0 : userVolume, 1500);
      animateVinylSpin(true);
      updateMusicPlayer();
    } catch (error) {
      console.error("Music could not be started:", error);
      updateMusicPlayer();
    } finally {
      startRequest = null;
    }
  })();

  return startRequest;
}

function pauseBackgroundMusic() {
  if (backgroundMusic.paused || pauseRequest) return;

  pauseRequest = true;

  animateVinylSpin(false);

  fadeAudioTo(0, 1100, () => {
    backgroundMusic.pause();
    pauseRequest = false;
    updateMusicPlayer();
  });
}

function toggleBackgroundMusic() {
  if (backgroundMusic.paused) {
    startBackgroundMusic();
  } else {
    pauseBackgroundMusic();
  }
}

vinylToggle.addEventListener("click", toggleBackgroundMusic);
vinylPlayButton.addEventListener("click", toggleBackgroundMusic);

vinylMute.addEventListener("click", () => {
  isMuted = !isMuted;

  fadeAudioTo(isMuted ? 0 : userVolume, 450);
  updateMusicPlayer();
});

musicVolume.addEventListener("input", () => {
  userVolume = Number(musicVolume.value);

  if (userVolume > 0 && isMuted) {
    isMuted = false;
  }

  if (!isMuted && !backgroundMusic.paused) {
    fadeAudioTo(userVolume, 180);
  }

  updateMusicPlayer();
});

backgroundMusic.addEventListener("play", () => {
  animateVinylSpin(true);
  updateMusicPlayer();
});

backgroundMusic.addEventListener("pause", updateMusicPlayer);
backgroundMusic.addEventListener("ended", updateMusicPlayer);

updateMusicPlayer();

// =========================================
// PARTICLE INTRO
// =========================================

const introCanvas = document.getElementById("introParticles");
const introContext = introCanvas.getContext("2d");

let introParticles = [];
let introAnimationFrame;

let introWidth = 0;
let introHeight = 0;
let introDpr = 1;

let solidTitleProgress = 0;
let solidTitleTarget = 0;

function createIntroParticles() {
  introWidth = window.innerWidth;
  introHeight = window.innerHeight;

  introDpr = Math.min(window.devicePixelRatio || 1, 2);

  introCanvas.width = introWidth * introDpr;
  introCanvas.height = introHeight * introDpr;

  introCanvas.style.width = introWidth + "px";
  introCanvas.style.height = introHeight + "px";

  introContext.setTransform(introDpr, 0, 0, introDpr, 0, 0);

  const textCanvas = document.createElement("canvas");
  const textContext = textCanvas.getContext("2d");

  textCanvas.width = introWidth;
  textCanvas.height = introHeight;

  const mobile = introWidth < 600;

  const fontSize = mobile
    ? Math.min(introWidth * 0.105, 52)
    : Math.min(introWidth * 0.085, 105);

  const letterSpacing = fontSize * 0.2;

  textContext.fillStyle = "#ffffff";
  textContext.textAlign = "center";
  textContext.textBaseline = "middle";

  textContext.font = `500 ${fontSize}px "Cormorant Garamond", Georgia, serif`;

  if ("letterSpacing" in textContext) {
    textContext.letterSpacing = `${letterSpacing}px`;
  }

  textContext.fillText("THE UNSEEN", introWidth / 2, introHeight / 2);

  const imageData = textContext.getImageData(
    0,
    0,
    introWidth,
    introHeight,
  ).data;

  introParticles = [];

  const spacing = mobile ? 4 : 5;

  for (let y = 0; y < introHeight; y += spacing) {
    for (let x = 0; x < introWidth; x += spacing) {
      const index = (y * introWidth + x) * 4;

      if (imageData[index + 3] > 100) {
        introParticles.push({
          x: Math.random() * introWidth,
          y: Math.random() * introHeight,
          targetX: x,
          targetY: y,
          size: Math.random() * 1.4 + 0.6,
          alpha: Math.random() * 0.45 + 0.55,
          speed: Math.random() * 0.035 + 0.025,
          isText: true,
        });
      }
    }
  }

  const backgroundCount = mobile ? 90 : 170;

  for (let i = 0; i < backgroundCount; i++) {
    introParticles.push({
      x: Math.random() * introWidth,
      y: Math.random() * introHeight,
      targetX: Math.random() * introWidth,
      targetY: Math.random() * introHeight,
      size: Math.random() * 1.3 + 0.3,
      alpha: Math.random() * 0.4 + 0.1,
      drift: Math.random() * 0.5 + 0.15,
      isText: false,
    });
  }
}

function animateIntroParticles() {
  introContext.clearRect(0, 0, introWidth, introHeight);

  solidTitleProgress += (solidTitleTarget - solidTitleProgress) * 0.035;

  if (Math.abs(solidTitleTarget - solidTitleProgress) < 0.001) {
    solidTitleProgress = solidTitleTarget;
  }

  introParticles.forEach((particle) => {
    if (particle.isText) {
      particle.x += (particle.targetX - particle.x) * particle.speed;
      particle.y += (particle.targetY - particle.y) * particle.speed;
    } else {
      particle.x += Math.sin(Date.now() * 0.0005 + particle.y) * 0.12;
      particle.y -= particle.drift * 0.12;

      if (particle.y < -5) {
        particle.y = introHeight + 5;
        particle.x = Math.random() * introWidth;
      }
    }

    const alpha = particle.isText
      ? particle.alpha * (1 - solidTitleProgress)
      : particle.alpha;

    if (alpha <= 0.01) return;

    introContext.beginPath();

    introContext.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);

    introContext.fillStyle = `rgba(190, 221, 255, ${alpha})`;

    introContext.shadowBlur = particle.isText ? 9 : 5;

    introContext.shadowColor = particle.isText
      ? "rgba(65, 153, 255, 0.9)"
      : "rgba(65, 153, 255, 0.5)";

    introContext.fill();
  });

  if (solidTitleProgress > 0) {
    const mobile = introWidth < 600;

    const fontSize = mobile
      ? Math.min(introWidth * 0.105, 52)
      : Math.min(introWidth * 0.085, 105);

    const letterSpacing = fontSize * 0.2;

    introContext.save();

    introContext.globalAlpha = solidTitleProgress;

    introContext.font = `500 ${fontSize}px "Cormorant Garamond", Georgia, serif`;
    introContext.textAlign = "center";
    introContext.textBaseline = "middle";

    if ("letterSpacing" in introContext) {
      introContext.letterSpacing = `${letterSpacing}px`;
    }

    introContext.fillStyle = "#eaf4ff";
    introContext.shadowBlur = 12;
    introContext.shadowColor = "rgba(120, 180, 255, 0.3)";

    introContext.fillText("THE UNSEEN", introWidth / 2, introHeight / 2);

    introContext.restore();
  }

  introContext.shadowBlur = 0;

  introAnimationFrame = requestAnimationFrame(animateIntroParticles);
}

// =========================================
// ACCOUNT HELPERS
// =========================================

function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem("unseenAccounts") || "{}");
  } catch (error) {
    return {};
  }
}

function getSavedSession() {
  try {
    return JSON.parse(localStorage.getItem("unseenSession") || "null");
  } catch (error) {
    localStorage.removeItem("unseenSession");
    return null;
  }
}

// =========================================
// REVEAL LANDING / RESTORE SESSION
// =========================================

function revealLanding(session) {
  if (session && session.email) {
    const accounts = getAccounts();
    const account = accounts[session.email];

    if (!account) {
      localStorage.removeItem("unseenSession");

      landing.classList.remove("hidden");
      vinylPlayer.classList.add("visible");

      return;
    }

    if (!account.profileCompleted) {
      window.location.href = "pages/profile-setup.html";
      return;
    }

    // Existing logged-in user goes directly to homepage.
    window.location.href = "pages/homepage.html";
    return;
  }

  landing.classList.remove("hidden");
  vinylPlayer.classList.add("visible");
}

// =========================================
// START INTRO
// =========================================

function startIntro() {
  const session = getSavedSession();

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  document.fonts.ready.then(() => {
    createIntroParticles();

    solidTitleProgress = 0;
    solidTitleTarget = 0;

    animateIntroParticles();

    if (reducedMotion) {
      solidTitleProgress = 1;
      solidTitleTarget = 1;

      intro.classList.add("logo-visible", "caption-visible");

      setTimeout(() => {
        intro.classList.add("burst");
      }, 500);

      setTimeout(() => {
        revealLanding(session);

        cancelAnimationFrame(introAnimationFrame);
        intro.remove();
      }, 2000);

      return;
    }

    setTimeout(() => {
      solidTitleTarget = 1;
    }, 6500);

    setTimeout(() => {
      intro.classList.add("logo-visible");
    }, 9000);

    setTimeout(() => {
      intro.classList.add("caption-visible");
    }, 10200);

    setTimeout(() => {
      intro.classList.add("burst");
    }, 11900);

    setTimeout(() => {
      revealLanding(session);
    }, 12800);

    setTimeout(() => {
      intro.classList.add("fade-out");
    }, 13100);

    setTimeout(() => {
      cancelAnimationFrame(introAnimationFrame);
      intro.remove();
    }, 14400);
  });
}

window.addEventListener("load", startIntro);

// =========================================
// MORE MENU
// =========================================

const moreButton = document.getElementById("moreButton");
const moreMenu = document.querySelector(".more-menu");

moreButton.addEventListener("click", () => {
  moreMenu.classList.toggle("open");
});

document.addEventListener("click", (event) => {
  if (moreMenu && !moreMenu.contains(event.target)) {
    moreMenu.classList.remove("open");
  }
});

// =========================================
// MOBILE MENU
// =========================================

const mobileMenu = document.getElementById("mobileMenu");
const mobileMenuButton = document.getElementById("mobileMenuButton");

mobileMenuButton.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");

  const isOpen = !mobileMenu.classList.contains("hidden");

  mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
});

// =========================================
// AUTH MODAL
// =========================================

function openAuth(mode) {
  authMode = mode;

  authError.textContent = "";
  authForm.reset();

  const nameGroup = document.getElementById("nameGroup");
  const title = document.getElementById("modalTitle");
  const kicker = document.getElementById("modalKicker");
  const description = document.getElementById("modalDescription");
  const submit = document.getElementById("modalSubmit");
  const switchText = document.getElementById("modalSwitch");

  if (mode === "signup") {
    nameGroup.classList.remove("hidden");

    kicker.textContent = "YOUR JOURNEY BEGINS";
    title.textContent = "Create your account";
    description.textContent = "Step into a world of stories.";

    submit.innerHTML = "Create account <span>↗</span>";

    switchText.innerHTML =
      'Already have an account? <button type="button" data-auth="signin">Sign in</button>';
  } else {
    nameGroup.classList.add("hidden");

    kicker.textContent = "WELCOME BACK";
    title.textContent = "Good to see you again";
    description.textContent = "Your next chapter is waiting.";

    submit.innerHTML = "Sign in <span>↗</span>";

    switchText.innerHTML =
      'New to The Unseen? <button type="button" data-auth="signup">Create account</button>';
  }

  authOverlay.classList.remove("hidden");

  mobileMenu.classList.add("hidden");

  mobileMenuButton.setAttribute("aria-expanded", "false");
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-auth]");

  if (button) {
    openAuth(button.dataset.auth);
  }
});

document.getElementById("authClose").addEventListener("click", () => {
  authOverlay.classList.add("hidden");
});

authOverlay.addEventListener("click", (event) => {
  if (event.target === authOverlay) {
    authOverlay.classList.add("hidden");
  }
});

// =========================================
// PASSWORD HASHING
// =========================================

async function hashPassword(password) {
  if (!crypto.subtle) {
    throw new Error("Please run this project using VS Code Live Server.");
  }

  const data = new TextEncoder().encode(password);

  const hash = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// =========================================
// REGISTER / SIGN IN
// =========================================

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  authError.textContent = "";

  const name = document.getElementById("accountName").value.trim();

  const email = document
    .getElementById("accountEmail")
    .value.trim()
    .toLowerCase();

  const password = document.getElementById("accountPassword").value;

  try {
    const passwordHash = await hashPassword(password);
    const accounts = getAccounts();

    // -------------------------------------
    // CREATE ACCOUNT
    // -------------------------------------

    if (authMode === "signup") {
      if (name.length < 2) {
        authError.textContent = "Please enter your name.";
        return;
      }

      if (accounts[email]) {
        authError.textContent = "This email is already registered.";
        return;
      }

      const account = {
        name,
        email,
        passwordHash,

        profile: null,
        profileCompleted: false,

        stats: {
          storiesRead: 0,
          followers: 0,
          following: 0,
        },

        activity: {
          readStories: [],
          categoriesExplored: [],
          publishedStories: 0,
        },

        achievements: [],
      };

      accounts[email] = account;

      localStorage.setItem("unseenAccounts", JSON.stringify(accounts));

      localStorage.setItem(
        "unseenSession",
        JSON.stringify({
          name: account.name,
          email: account.email,
        }),
      );

      // New users complete their profile first.
      window.location.href = "pages/profile-setup.html";
      return;
    }

    // -------------------------------------
    // SIGN IN
    // -------------------------------------

    const account = accounts[email];

    if (!account || account.passwordHash !== passwordHash) {
      authError.textContent = "Incorrect email or password.";
      return;
    }

    localStorage.setItem(
      "unseenSession",
      JSON.stringify({
        name: account.name,
        email: account.email,
      }),
    );

    // Incomplete profile goes to profile setup.
    if (!account.profileCompleted) {
      window.location.href = "pages/profile-setup.html";
      return;
    }

    // Completed account goes directly to homepage.
    window.location.href = "pages/homepage.html";
    return;
  } catch (error) {
    authError.textContent = error.message || "Something went wrong.";
  }
});

// =========================================
// DASHBOARD
// =========================================

function openDashboard(account) {
  landing.classList.add("hidden");
  authOverlay.classList.add("hidden");

  dashboard.classList.remove("hidden");
  vinylPlayer.classList.remove("visible");

  document.getElementById("dashboardUserName").textContent = (
    account.profile?.displayName || account.name
  ).toUpperCase();

  localStorage.setItem(
    "unseenSession",
    JSON.stringify({
      name: account.name,
      email: account.email,
    }),
  );
}

document.getElementById("signoutButton").addEventListener("click", () => {
  localStorage.removeItem("unseenSession");

  dashboard.classList.add("hidden");
  landing.classList.remove("hidden");
  vinylPlayer.classList.add("visible");
});

// =========================================
// LANDING BUTTONS
// =========================================

document.getElementById("exploreButton").addEventListener("click", () => {
  // Explore section will be added later.
});

document.getElementById("trailerButton").addEventListener("click", () => {
  alert("The Unseen trailer will be added here.");
});
