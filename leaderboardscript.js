import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, onValue, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// ----------------------------
// Firebase config
// ----------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAEdixCzS_7_CWoWEMzvaIZyU4LHn59I3g",
  authDomain: "rcl-official.firebaseapp.com",
  databaseURL: "https://rcl-official-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rcl-official",
  storageBucket: "rcl-official.firebasestorage.app",
  messagingSenderId: "812939456614",
  appId: "1:812939456614:web:d3fa06dab0af2d1afd7da7",
  measurementId: "G-0K7KE15K2F"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const orderRef = ref(db, "leaderboard/order");
const playersRef = ref(db, "leaderboard/players");

const container = document.getElementById("row-container");
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

// ----------------------------
// Helper Functions
// ----------------------------
function updateRanks() {
  container.querySelectorAll(".row").forEach((row, index) => {
    row.querySelector(".rank").textContent = index + 1;
  });
}

function saveOrder() {
  const orderArray = [...container.querySelectorAll(".row")].map(row => row.dataset.id);
  set(orderRef, orderArray)
    .then(() => console.log("Order saved"))
    .catch(err => console.error(err));
}

function savePlayerFields(row) {
  const playerId = row.dataset.id;
  const fields = [...row.querySelectorAll(".info-btn div")].map(d => d.textContent);
  return update(ref(db, `leaderboard/players/${playerId}`), { fields })
    .then(() => console.log(`Fields updated for ${playerId}`))
    .catch(err => console.error(err));
}

function playStaggeredAnimation() {
  [...container.querySelectorAll(".row")].forEach((row, i) => {
    row.classList.remove("bounce-in");
    void row.offsetWidth;
    row.style.animationDelay = `${i * 0.05}s`;
    row.classList.add("bounce-in");
  });
}

// ----------------------------
// Editable only for logged-in user
// ----------------------------
function makeEditable() {
  const loggedUser = localStorage.getItem("loggedInUser"); 
  if (!loggedUser) return;

  const rows = container.querySelectorAll(".row");

  rows.forEach(row => {
    const usernameDiv = row.querySelector(".info-btn div:nth-child(2)");
    if (!usernameDiv) return;

    // Permanently highlight logged-in user row
    if (usernameDiv.textContent === loggedUser) {
      row.classList.add("logged-in");

      const infoDivs = row.querySelectorAll(".info-btn div");

      infoDivs.forEach(div => {
        let editing = false;

        div.addEventListener("dblclick", () => {
          if (editing) return;
          editing = true;

          row.setAttribute("draggable", "false");
          div.setAttribute("contenteditable", "true");
          div.focus();
          div.style.outline = "1px solid #fff";

          // Highlight while editing
          row.classList.add("editable");

          const finish = () => {
            div.removeAttribute("contenteditable");
            div.style.outline = "none";
            row.setAttribute("draggable", "true");

            // Remove editable glow but keep logged-in highlight
            row.classList.remove("editable");

            const playerId = row.dataset.id;
            const fields = [...row.querySelectorAll(".info-btn div")].map(d => d.textContent);
            set(ref(db, `leaderboard/players/${playerId}`), { fields })
              .finally(() => editing = false);
          };

          const keyHandler = (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              finish();
              div.removeEventListener("keydown", keyHandler);
              document.removeEventListener("click", clickHandler);
            }
          };

          const clickHandler = (e) => {
            if (e.target !== div) {
              finish();
              document.removeEventListener("click", clickHandler);
              div.removeEventListener("keydown", keyHandler);
            }
          };

          div.addEventListener("keydown", keyHandler);
          setTimeout(() => document.addEventListener("click", clickHandler), 0);
        });
      });
    }
  });
}



// ----------------------------
// Drag & Drop
// ----------------------------
let draggedRow = null;
container.addEventListener("dragstart", e => {
  if (e.target.classList.contains("row")) {
    draggedRow = e.target;
    e.target.style.opacity = 0.5;
  }
});
container.addEventListener("dragend", e => {
  if (e.target.classList.contains("row")) {
    e.target.style.opacity = "";
    updateRanks();
    saveOrder();
  }
});
container.addEventListener("dragover", e => {
  e.preventDefault();
  const after = getDragAfterElement(container, e.clientY);
  if (!after) container.appendChild(draggedRow);
  else container.insertBefore(draggedRow, after);
});
function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll(".row:not(.dragging)")];
  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    else return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ----------------------------
// Load leaderboard from Firebase
// ----------------------------
function loadLeaderboard() {
  onValue(orderRef, snapshot => {
    const savedOrder = snapshot.val();
    if (savedOrder) {
      savedOrder.forEach(id => {
        const row = container.querySelector(`.row[data-id="${id}"]`);
        if (row) container.appendChild(row);
      });
      updateRanks();
      makeEditable();
      playStaggeredAnimation();
    }
  });

  onValue(playersRef, snapshot => {
    const data = snapshot.val();
    if (!data) return;

    Object.entries(data).forEach(([playerId, playerData]) => {
      const row = container.querySelector(`.row[data-id="${playerId}"]`);
      if (!row || !playerData.fields) return;
      const divs = row.querySelectorAll(".info-btn div");
      playerData.fields.forEach((text, i) => {
        if (divs[i]) divs[i].textContent = text;
      });
    });

    makeEditable();
  });
}

// ----------------------------
// Init
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadLeaderboard();
  [...container.querySelectorAll(".row")].forEach((row, i) => {
    row.classList.remove("bounce-in");
    void row.offsetWidth;
    row.style.animationDelay = `${i * 0.05}s`;
    row.classList.add("bounce-in");
  });

  // Glow effect
  document.querySelectorAll('.info-btn').forEach(button => {
    button.addEventListener('mousemove', e => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      button.style.setProperty('--x', `${x}px`);
      button.style.setProperty('--y', `${y}px`);
    });
  });
});