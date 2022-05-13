import regeneratorRuntime from "regenerator-runtime";
import { async } from "regenerator-runtime";

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtn = document.querySelectorAll(".deleteBtn");
const editBtn = document.querySelectorAll(".editBtn");
const editForm = document.getElementById("edit__comment-form");
const editBox = document.getElementById("editBox");
const editTextarea = document.getElementById("editTextarea");
const editCancelBtn = document.querySelectorAll(".editCancelBtn");

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
  const span3 = document.createElement("span");
  span3.innerText = "수정";
  span3.style = "cursor:pointer";
  span3.dataset.id = newCommentId;
  newComments.appendChild(icon);
  newComments.appendChild(span);
  newComments.appendChild(span3);
  newComments.appendChild(span2);
  videoComments.prepend(newComments);
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

const handleEditComment = async (event) => {
  event.preventDefault();
  const editTextarea = editForm.querySelector("textarea");
  const text = editTextarea.value;
  const commentId = event.target.dataset.id;
  if (text === "" || text.trim() === "") {
    return;
  }
  const response = await fetch(`/api/${commentId}/editcomments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 200) {
    editedComment(text);
  }
};

const editedComment = (text) => {
  const newEditedComment = document.getElementById("comment");
  newEditedComment.innerText = ` ${text}`;
};

editBtn.forEach((element) =>
  element.addEventListener("click", (event) => {
    const Box = event.target.parentNode.querySelector(".edit__comment");
    Box.style = "display : block";
  })
);

editCancelBtn.forEach((element) =>
  element.addEventListener("click", (event) => {
    const close =
      event.target.parentNode.parentNode.parentNode.querySelector(
        ".edit__comment"
      );
    close.style = "display : none";
  })
);

if (editForm) {
  editForm.addEventListener("submit", handleEditComment);
}
