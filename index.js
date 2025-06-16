let tasks = [];

// Загрузка задач из localStorage
function loadTasks () {
  const saved = localStorage.getItem('tasks');
  if (saved) {
    tasks = JSON.parse(saved);
    // Обновляем формат данных для старых версий
    tasks.forEach((task) => {
      if (!task.priority) task.priority = 'low';
      if (!task.deadline) task.deadline = '';
    });
    renderTasks();
  }
}

// Сохранение задач в localStorage
function saveTasks () {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Отрисовка задач
function renderTasks () {
  ['todo', 'inprogress', 'done'].forEach((status) => {
    const container = document.getElementById(`${status}-tasks`);
    container.innerHTML = '';
    tasks.filter((t) => t.status === status).forEach((task) => {
      const taskDiv = document.createElement('div');
      taskDiv.className = `task priority-${task.priority}`;
      taskDiv.draggable = true;
      taskDiv.ondragstart = dragStart;
      taskDiv.id = `task-${task.id}`;

      // Контент задачи
      const content = document.createElement('div');
      content.innerHTML = `
                        <div>${task.text}</div>
                        ${task.deadline
        ? `<div class="deadline">До: ${task.deadline}</div>`
        : ''}
                    `;

      // Кнопка удаления
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '×';
      deleteBtn.onclick = () => {
        if (confirm('Удалить задачу?')) {
          tasks = tasks.filter((t) => t.id !== task.id);
          saveTasks();
          renderTasks();
        }
      };

      // Кнопка редактирования
      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.textContent = '✎';
      editBtn.onclick = () => {
        editTask(task);
      };

      taskDiv.appendChild(deleteBtn);
      taskDiv.appendChild(editBtn);
      taskDiv.appendChild(content);
      container.appendChild(taskDiv);
    });
  });
}

// Добавление новой задачи
function addTask () {
  const input = document.getElementById('task-input');
  const deadlineInput = document.getElementById('deadline-input');
  const prioritySelect = document.getElementById('priority-select');

  const text = input.value.trim();
  const deadline = deadlineInput.value;
  const priority = prioritySelect.value;

  if (text) {
    const newTask = {
      id: Date.now().toString(),
      text: text,
      status: 'todo',
      deadline: deadline,
      priority: priority,
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    input.value = '';
    deadlineInput.value = '';
    prioritySelect.value = 'low';
  }
}

// Редактирование задачи
function editTask (task) {
  const newText = prompt('Редактировать задачу:', task.text);
  if (newText !== null && newText.trim()) {
    const newDeadline = prompt(
      'Срок выполнения (YYYY-MM-DD):',
      task.deadline || '',
    );
    const newPriority = prompt(
      'Приоритет (low, medium, high):',
      task.priority || 'low',
    );

    task.text = newText.trim();
    task.deadline = newDeadline?.trim() || '';
    task.priority = ['low', 'medium', 'high'].includes(
      newPriority?.trim().toLowerCase(),
    )
      ? newPriority.trim().toLowerCase()
      : task.priority;

    saveTasks();
    renderTasks();
  }
}

// Начало перетаскивания
function dragStart (event) {
  event.dataTransfer.setData('text/plain', event.target.id);
}

// Разрешить перетаскивание
function allowDrop (event) {
  event.preventDefault();
}

// Завершение перетаскивания
function drop (event) {
  event.preventDefault();
  const draggedId = event.dataTransfer.getData('text/plain');
  const taskId = draggedId.replace('task-', '');
  const task = tasks.find((t) => t.id === taskId);

  if (task) {
    const columnId = event.currentTarget.id;
    task.status = columnId;
    saveTasks();
    renderTasks();
  }
}

// Инициализация
loadTasks();
renderTasks();
