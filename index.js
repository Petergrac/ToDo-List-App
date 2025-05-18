// index.js

// Selectors
const createForm = document.querySelectorAll('.account form')[0];
const loginForm = document.querySelectorAll('.account form')[1];
const addTaskBtn = document.querySelector('.add');
const tasksContainer = document.querySelector('.tasks');
const mainContainer = document.querySelector('.main');

let currentUser = null;

// Utility: Load and Save
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || {};
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function saveTasks(user, tasks) {
    const users = getUsers();
    users[user].tasks = tasks;
    saveUsers(users);
}

function loadTasks(user) {
    const users = getUsers();
    return users[user]?.tasks || [];
}

// Hide auth forms on login or account creation
function hideAuthForms() {
    mainContainer.style.display = 'none';
    document.querySelector('.main-content').style.display = 'block';
}

// Create logout button
function createLogoutButton() {
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.className = 'add';
    logoutBtn.style.margin = '10px';
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        location.reload();
    });
    document.querySelector('.namespace').appendChild(logoutBtn);
}

// Account Creation
createForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = createForm.querySelector('input[type="text"]').value.trim();
    const [pass1, pass2] = createForm.querySelectorAll('.passwd');

    if (pass1.value !== pass2.value) return alert("Passwords don't match");

    const users = getUsers();
    if (users[name]) return alert('User already exists');

    users[name] = { password: pass1.value, tasks: [] };
    saveUsers(users);
    alert('Account created. Please log in.');
    createForm.reset();
});

// Login
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = loginForm.querySelector('input[type="text"]').value.trim();
    const password = loginForm.querySelector('input[type="password"]').value;

    const users = getUsers();
    if (!users[username] || users[username].password !== password) return alert('Invalid credentials');

    currentUser = username;
    renderTasks();
    hideAuthForms();
    createLogoutButton();
    alert('Logged in!');
    loginForm.reset();
});

// Add Task
addTaskBtn.addEventListener('click', () => {
    if (!currentUser) return alert('Please log in to add tasks.');
    const title = prompt('Enter task title:');
    if (!title) return;
    const content = prompt('Enter task content/details:');
    const createdAt = new Date().toISOString();

    const tasks = loadTasks(currentUser);
    tasks.push({ title, content, done: false, createdAt });
    saveTasks(currentUser, tasks);
    renderTasks();
});

// Render Tasks
function renderTasks() {
    let tasks = loadTasks(currentUser);

    // Sort by date (latest first)
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    tasksContainer.innerHTML = '';
    tasks.forEach((task, index) => {
        const taskEl = document.createElement('div');
        taskEl.className = 'task';

        const date = new Date(task.createdAt).toLocaleString();

        taskEl.innerHTML = `
            <label id="check">
                <input type="checkbox" class="check" ${task.done ? 'checked' : ''} data-index="${index}">
                <div>
                    <p style="text-decoration: ${task.done ? 'line-through' : 'none'}; font-weight: bold;">${task.title}</p>
                    <p style="font-size: 0.9em; color: white;">${task.content}</p>
                    <p style="font-size: 0.75em; color: lightgray;">Created: ${date}</p>
                </div>
            </label>
            <div id="buttons-task">
                <button class="btn delete" data-index="${index}">🗑️</button>
                <button class="btn edit" data-index="${index}">✏️</button>
            </div>
        `;

        tasksContainer.appendChild(taskEl);
    });
}

// Task Actions
tasksContainer.addEventListener('click', e => {
    const index = e.target.dataset.index;
    if (index === undefined || !currentUser) return;

    let tasks = loadTasks(currentUser);

    if (e.target.classList.contains('delete')) {
        tasks.splice(index, 1);
    } else if (e.target.classList.contains('edit')) {
        const newTitle = prompt('Edit task title:', tasks[index].title);
        const newContent = prompt('Edit task content:', tasks[index].content);
        if (newTitle) tasks[index].title = newTitle;
        if (newContent !== null) tasks[index].content = newContent;
    } else if (e.target.classList.contains('check')) {
        tasks[index].done = e.target.checked;
    }

    saveTasks(currentUser, tasks);
    renderTasks();
});
