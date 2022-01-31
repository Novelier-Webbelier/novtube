const videoContainer = document.querySelector("#videoContainer");
const form = document.querySelector("#commentForm");
const deleteBtn = document.querySelectorAll(".delete-btn");

const createCommentElement = (text, id) => {
  const parentElement = document.querySelector(".comments ul");
  const commentElement = document.createElement("li");
  commentElement.dataset.id = id;

  const commentSpan = document.createElement("span");
  commentSpan.innerText = text;

  const deleteSpan = document.createElement("span");
  deleteSpan.innerText = "❌";
  deleteSpan.classList.add("delete-btn");

  commentElement.appendChild(commentSpan);
  commentElement.appendChild(deleteSpan);
  parentElement.prepend(commentElement);

  const textarea = form.querySelector("textarea");
  textarea.value = "";
}

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }

  const res = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (res.status === 201) {
    const { newCommentId } = await res.json();
    createCommentElement(text, newCommentId);
  }
};

const handleDelete = async (event) => {
  const li  =event.path[1];

  const res = await fetch(`/api/videos/${li.dataset.id}/comment/delete`, {
    method: "DELETE",
  })

  if (res.status === 200) {
    li.remove();
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

if (deleteBtn) {
  console.log(deleteBtn);
  for (let i = 0; i < deleteBtn.length; i++) {
    const element = deleteBtn[i];
    console.log("HI");
    element.addEventListener("click", handleDelete);
  }
}
