const STORAGE_KEY = "studentBlogPosts";
const USER_KEY = "studentBlogUser";

const defaultPosts = [
  {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: "Welcome to Student Blog",
    category: "Thoughts",
    content: "This is a simple place to share ideas, college experiences, stories and little moments worth remembering.",
    author: "Admin",
    date: new Date().toLocaleDateString()
  },
  {
    id: "sample-2",
    title: "Things I learned this week",
    category: "College",
    content: "Sometimes the smallest lessons are the ones that stay with us. Write down what you learned and share it with someone.",
    author: "Student",
    date: new Date().toLocaleDateString()
  },
  {
    id: "sample-3",
    title: "A thought worth keeping",
    category: "Life",
    content: "You do not need to have everything figured out. Keep learning, keep creating and keep moving forward.",
    author: "Student",
    date: new Date().toLocaleDateString()
  }
];

let posts = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
if (!posts) {
  posts = defaultPosts;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

let user = localStorage.getItem(USER_KEY) || "";

const postsGrid = document.getElementById("postsGrid");
const myPosts = document.getElementById("myPosts");
const emptyState = document.getElementById("emptyState");
const userStatus = document.getElementById("userStatus");

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderPosts() {
  if (!posts.length) {
    postsGrid.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  postsGrid.innerHTML = posts.map(post => `
    <article class="post-card">
      <span class="tag">${escapeHTML(post.category)}</span>
      <h3>${escapeHTML(post.title)}</h3>
      <p>${escapeHTML(post.content)}</p>
      <div class="post-meta">By ${escapeHTML(post.author)} · ${escapeHTML(post.date)}</div>
    </article>
  `).join("");
}

function renderDashboard() {
  userStatus.textContent = user ? `Logged in as ${user}` : "Guest mode";

  const mine = user ? posts.filter(post => post.author === user) : [];

  if (!user) {
    myPosts.innerHTML = `<p class="muted">Log in to see and manage your posts.</p>`;
    return;
  }

  if (!mine.length) {
    myPosts.innerHTML = `<p class="muted">You have not written any posts yet.</p>`;
    return;
  }

  myPosts.innerHTML = mine.map(post => `
    <div class="my-post-row">
      <div>
        <strong>${escapeHTML(post.title)}</strong>
        <div class="muted">${escapeHTML(post.category)} · ${escapeHTML(post.date)}</div>
      </div>
      <div class="my-post-actions">
        <button class="action-btn" onclick="editPost('${post.id}')">Edit</button>
        <button class="action-btn delete" onclick="deletePost('${post.id}')">Delete</button>
      </div>
    </div>
  `).join("");
}

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

function openEditor(post = null) {
  if (!user) {
    openModal("loginModal");
    return;
  }

  document.getElementById("postForm").reset();
  document.getElementById("postId").value = post ? post.id : "";
  document.getElementById("editorHeading").textContent = post ? "Edit your post" : "Write a post";

  if (post) {
    document.getElementById("postTitle").value = post.title;
    document.getElementById("postCategory").value = post.category;
    document.getElementById("postContent").value = post.content;
  }

  openModal("postModal");
}

document.getElementById("loginBtn").addEventListener("click", () => openModal("loginModal"));
document.getElementById("heroWrite").addEventListener("click", () => openEditor());
document.getElementById("writeBtn").addEventListener("click", () => openEditor());
document.getElementById("dashboardWrite").addEventListener("click", () => openEditor());

document.getElementById("saveLogin").addEventListener("click", () => {
  const name = document.getElementById("loginName").value.trim();

  if (!name) {
    alert("Please enter your name.");
    return;
  }

  user = name;
  localStorage.setItem(USER_KEY, user);
  closeModal("loginModal");
  renderDashboard();
  openEditor();
});

document.getElementById("postForm").addEventListener("submit", event => {
  event.preventDefault();

  const id = document.getElementById("postId").value;
  const title = document.getElementById("postTitle").value.trim();
  const category = document.getElementById("postCategory").value;
  const content = document.getElementById("postContent").value.trim();

  if (!title || !content) return;

  if (id) {
    const index = posts.findIndex(post => post.id === id);
    if (index !== -1 && posts[index].author === user) {
      posts[index] = { ...posts[index], title, category, content };
    }
  } else {
    posts.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      title,
      category,
      content,
      author: user,
      date: new Date().toLocaleDateString()
    });
  }

  savePosts();
  renderPosts();
  renderDashboard();
  closeModal("postModal");
  document.getElementById("explore").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => closeModal(button.dataset.close));
});

document.querySelectorAll(".modal").forEach(modal => {
  modal.addEventListener("click", event => {
    if (event.target === modal) modal.classList.add("hidden");
  });
});

window.editPost = function(id) {
  const post = posts.find(item => item.id === id);
  if (post && post.author === user) openEditor(post);
};

window.deletePost = function(id) {
  const post = posts.find(item => item.id === id);
  if (!post || post.author !== user) return;

  if (confirm("Delete this post?")) {
    posts = posts.filter(item => item.id !== id);
    savePosts();
    renderPosts();
    renderDashboard();
  }
};

renderPosts();
renderDashboard();
