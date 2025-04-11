const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const themeToggle = document.getElementById("theme-toggle");
const filterButtons = document.querySelectorAll("#filter-buttons button");
const prioritySelect = document.getElementById("priority-select");

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    const filter = button.getAttribute("data-filter");
    const tasks = document.querySelectorAll("#task-list li");

    tasks.forEach(task => {
      switch (filter) {
        case "all":
          task.style.display = "flex";
          break;
        case "pending":
          task.style.display = task.classList.contains("completed") ? "none" : "flex";
          break;
        case "completed":
          task.style.display = task.classList.contains("completed") ? "flex" : "none";
          break;
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  const isDark = savedTheme === "dark";
  document.body.classList.toggle("dark", isDark);
  themeToggle.innerHTML = isDark
    ? `<i class="fas fa-sun"></i>`
    : `<i class="fas fa-moon"></i>`;
  loadTasks();
});

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.innerHTML = isDark
    ? `<i class="fas fa-sun"></i>`
    : `<i class="fas fa-moon"></i>`;
});

function updateTaskCount() {
  const total = document.querySelectorAll("#task-list li").length;
  taskCount.textContent = `${total} ${total === 1 ? "tarefa" : "tarefas"}`;
}

function saveTasks() {
  const tasks = Array.from(taskList.children).map(li => {
    const text = li.querySelector(".task-text")?.textContent.trim() || "";
    const timestamp = li.querySelector(".timestamp")?.textContent || "";
    const priority = li.getAttribute("data-priority") || "medium";
    return {
      text,
      completed: li.classList.contains("completed"),
      timestamp,
      priority
    };
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
  updateTaskCount();
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach(task => createTask(task.text, task.completed, task.timestamp, task.priority));
  updateTaskCount();
}

function formatPriority(priority) {
  if (priority === "low") return "Baixa";
  if (priority === "medium") return "Média";
  if (priority === "high") return "Alta";
  return "";
}

function createTask(text, completed = false, timestampStr = null, priority = "medium") {
  const li = document.createElement("li");
  li.setAttribute("data-priority", priority);
  li.classList.add(`priority-${priority}`);
  if (completed) li.classList.add("completed");

  const container = document.createElement("div");
  container.className = "task-container";

  const span = document.createElement("span");
  span.className = "task-text";

  span.innerHTML = `
    <i class="fa-regular fa-circle-check"></i> 
    <strong class="priority-${priority}">[${formatPriority(priority)}]</strong> ${text}
  `;

  const timestamp = document.createElement("small");
  timestamp.className = "timestamp";
  timestamp.textContent = timestampStr || `Adicionada em: ${new Date().toLocaleString("pt-BR")}`;

  span.addEventListener("click", () => {
    li.classList.toggle("completed");
    saveTasks();
  });

  span.addEventListener("dblclick", () => {
    const inputEdit = document.createElement("input");
    inputEdit.type = "text";
    inputEdit.value = text;
    inputEdit.className = "edit-input";
    li.replaceChild(inputEdit, container);
    inputEdit.focus();

    function saveEdit() {
      const newText = inputEdit.value.trim();
      if (newText) {
        text = newText;
        span.innerHTML = `
          <i class="fa-regular fa-circle-check"></i> 
          <strong class="priority-${priority}">[${formatPriority(priority)}]</strong> ${newText}
        `;
        container.replaceChild(span, container.firstChild);
        li.replaceChild(container, inputEdit);
        saveTasks();
      } else {
        li.remove();
        saveTasks();
      }
    }

    inputEdit.addEventListener("blur", saveEdit);
    inputEdit.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveEdit();
    });
  });

  container.appendChild(span);
  container.appendChild(timestamp);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete";
  deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
  deleteBtn.addEventListener("click", () => {
    li.remove();
    saveTasks();
  });

  li.appendChild(container);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);
  saveTasks();
}

addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  if (text) {
    createTask(text, false, null, priority);
    taskInput.value = "";
    prioritySelect.value = "medium";
    taskInput.focus();
  }
});

taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addBtn.click();
  }
});
