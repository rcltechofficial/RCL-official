// Navbar hide/show on scroll
let lastScrollY = window.scrollY;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > lastScrollY) {
    navbar.style.transform = 'translateY(-100%)';
  } else {
    navbar.style.transform = 'translateY(0)';
  }
  lastScrollY = window.scrollY;
});

// Replace login button if already logged in
const loginLink = document.getElementById("login-link");

function updateNavbarUsername(username) {
  if (!username) return;

  const cleanName = username.split("#")[0]; // remove everything after #
  loginLink.textContent = cleanName;
  loginLink.href = "#"; // disable going to login page
}

// Load saved login
const savedUser = localStorage.getItem("loggedInUser");
if (savedUser) {
  updateNavbarUsername(savedUser);
}

// LOGIN FORM FUNCTIONALITY
const form = document.querySelector("form");

// Firebase fetch URL
const firebaseURL =
  "https://rcl-official-default-rtdb.asia-southeast1.firebasedatabase.app/leaderboard/players.json";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // fetch database
  const res = await fetch(firebaseURL);
  const data = await res.json();

  // Find matching username + index
  const players = Object.values(data);

  let match = players.find(p => p.fields[1] === username);

  if (!match) {
    alert("Account not found!");
    return;
  }

  // Password list only for checking (preset)
  const presetPasswords = {
    "azustin#011": "myPass1",
    "Atelier#BOHOL": "myPass2",
    "RCL nath#2752": "nathPass",
    "RCL peonx#vlrt": "testpass",
    "faminedevil1107#9269": "famine123",
    "RCL Killa Queen#Kira": "kiraPass",
    "RCL kaii#150": "kaii123",
    "Pursuer#4552": "pursuerPass",
    "Free2Playmo1#2905": "free123",
    "TinySkinnyBones#001": "tinyPass",
    "bingoboo#booty": "bingo123"
  };

  if (presetPasswords[username] !== password) {
    alert("Incorrect password!");
    return;
  }

  // Save login
  localStorage.setItem("loggedInUser", username);

  // Update navbar
  updateNavbarUsername(username);

  alert("Login successful!");
  
});
