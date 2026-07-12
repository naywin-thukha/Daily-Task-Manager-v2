import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase-init.js";

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

function showError(el, message) {
  el.textContent = message;
  el.hidden = false;
}
function hideError(el) {
  el.hidden = true;
  el.textContent = "";
}

function friendlyAuthError(err) {
  const code = err.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "That email or password isn't right.";
  }
  if (code.includes("too-many-requests")) return "Too many attempts. Please wait a moment and try again.";
  if (code.includes("invalid-email")) return "That email address doesn't look right.";
  return "Something went wrong. Please try again.";
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError(loginError);
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  } catch (err) {
    showError(loginError, friendlyAuthError(err));
  }
});

// Already signed in? Skip straight to the app.
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "index.html";
});
