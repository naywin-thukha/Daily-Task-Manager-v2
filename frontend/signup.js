import {
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase-init.js";

const signupForm = document.getElementById("signupForm");
const signupError = document.getElementById("signupError");

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
  if (code.includes("email-already-in-use")) return "An account already exists for that email.";
  if (code.includes("weak-password")) return "Password should be at least 6 characters.";
  if (code.includes("invalid-email")) return "That email address doesn't look right.";
  return "Something went wrong. Please try again.";
}

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError(signupError);
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  } catch (err) {
    showError(signupError, friendlyAuthError(err));
  }
});

// Already signed in? Skip straight to the app.
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "index.html";
});
