document.addEventListener("DOMContentLoaded", function () {
  const collapsibles = document.querySelectorAll(".collapsible");

  collapsibles.forEach((collapsible) => {
    collapsible.addEventListener("click", function () {
      this.classList.toggle("collapsed");
      const content = this.nextElementSibling;
      if (content.computedStyleMap().get("display").toString() === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  });
});

function collapseAll() {
  const collapsibles = document.querySelectorAll(".collapsible");

  collapsibles.forEach((collapsible) => {
    collapsible.classList.add("collapsed");
    const content = collapsible.nextElementSibling;
    content.style.display = "none";
  });
}

function expandAll() {
  const collapsibles = document.querySelectorAll(".collapsible");

  collapsibles.forEach((collapsible) => {
    collapsible.classList.remove("collapsed");
    const content = collapsible.nextElementSibling;
    content.style.display = "block";
  });
}

function showHideArtifact(srcElement) {
  const control = document.getElementById("control_" + srcElement.id);
  if (control) {
    control.style.display = srcElement.checked ? "block" : "none";
  }
  srcElement.parentElement.classList.toggle("hideToc", !srcElement.checked);
}

function trigger_procedure(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const token = localStorage["githubToken"] ?? formData.get("token");
  const repo = formData.get("repo");
  const owner = formData.get("owner");
  const save_token = formData.get("save_token");
  formData.delete("token");
  formData.delete("repo");
  formData.delete("owner");
  formData.delete("save_token");
  if (save_token) {
    localStorage.setItem("githubToken", token);
  }
  const client_payload = {};
  formData.forEach((value, key) => (client_payload[key] = value));

  const data = {
    event_type: "trigger_procedure",
    client_payload,
  };

  fetch(`https://api.github.com/repos/${owner}/${repo}/dispatches`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`, // Ensure the token is securely handled
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        alert("Event dispatched successfully");
      } else {
        alert("Failed to dispatch event");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred");
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("githubToken");
  const authStatus = document.getElementById("authStatus");
  const authForm = document.getElementById("authForm");
  const tokenInput = document.getElementById("token");

  if (authForm) {
    if (token) {
      authStatus.style.display = "block";
      authForm.style.display = "none";
      tokenInput.disabled = true;
    } else {
      authStatus.style.display = "none";
      authForm.style.display = "block";
      tokenInput.disabled = false;
    }

    document.getElementById("clearToken").addEventListener("click", () => {
      localStorage.removeItem("githubToken");
      authStatus.style.display = "none";
      authForm.style.display = "block";
      tokenInput.disabled = false;
    });
  }
});
