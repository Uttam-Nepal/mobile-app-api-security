const loginForm = document.querySelector("#login-form");
const sessionStatus = document.querySelector("#session-status");
const storageStatus = document.querySelector("#storage-status");
const profileButton = document.querySelector("#profile-button");
const clearButton = document.querySelector("#clear-button");
const result = document.querySelector("#result");

let currentUserId = null;

function showCookieStatus() {
  storageStatus.textContent =
    "Improved design: token is handled by an HttpOnly cookie. Page JavaScript cannot read its value.";
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  result.textContent = "Signing in...";

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: document.querySelector("#email").value,
        password: document.querySelector("#password").value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed.");
    }

    // The JWT is set as an HttpOnly cookie by the server.
    // It is intentionally not read from the response or stored in JS.
    currentUserId = data.user.id;
    sessionStatus.textContent = `Signed in as ${data.user.display_name} (test user ${currentUserId}).`;

    profileButton.disabled = false;
    result.textContent =
      "Login successful. The server issued an HttpOnly cookie; the token is not exposed to page JavaScript.";

    document.querySelector("#password").value = "";
    showCookieStatus();
  } catch (error) {
    result.textContent = error.message;
  }
});

profileButton.addEventListener("click", async () => {
  if (!currentUserId) {
    result.textContent = "Sign in before loading a profile.";
    return;
  }

  try {
    const response = await fetch(`/api/profiles/${currentUserId}`, {
      method: "GET",
      credentials: "same-origin",
    });

    const data = await response.json();

    result.textContent = response.ok
      ? JSON.stringify(data.profile, null, 2)
      : `Request rejected: ${response.status} ${data.error}`;
  } catch {
    result.textContent = "Could not contact the local API.";
  }
});

clearButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Logout failed.");
    }

    currentUserId = null;
    profileButton.disabled = true;
    sessionStatus.textContent = "No active test session.";
    result.textContent = data.message;
    showCookieStatus();
  } catch (error) {
    result.textContent = error.message;
  }
});

showCookieStatus();
