import regeneratorRuntime from "regenerator-runtime";

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtn = document.querySelectorAll(".deleteBtn");

const addComment = (text, newCommentId) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComments = document.createElement("li");
  newComments.className = "video__comment";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  const span2 = document.createElement("span");
  span2.innerText = "❌";
  span2.style = "cursor:pointer";
  span2.dataset.id = newCommentId;
  span2.addEventListener("click", handledeleteComment);
  newComments.appendChild(icon);
  newComments.appendChild(span);
  newComments.appendChild(span2);
  videoComments.prepend(newComments);
  console.log(newCommentId);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "" || text.trim() === "") {
    return;
  }
  //text가 비어있으면 리턴한다.
  const response = await fetch(`/api/videos/${videoId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json();
    //백엔드에서 보내온 JSON파일을 추출한다.
    addComment(text, newCommentId);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}
const deleteComment = (target) => {
  const videoComments = document.querySelector(".video__comments ul");
  videoComments.removeChild(target);
};

const handledeleteComment = async (event) => {
  //const li = event.srcElement.parentNode;
  const commentId = event.target.dataset.id;
  const response = await fetch(`/api/comments/${commentId}`, {
    method: "DELETE",
  });
  if (response.status === 200) {
    deleteComment(event.target.parentNode);
  } else {
    alert("you are not the Owner!");
  }
};

deleteBtn.forEach((element) =>
  element.addEventListener("click", handledeleteComment)
);
