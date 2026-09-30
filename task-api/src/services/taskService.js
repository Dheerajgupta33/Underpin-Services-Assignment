const { v4: uuidv4 } = require('uuid');

let tasks = [];

const getAll = () => [...tasks];

const findById = (id) => tasks.find((task) => task.id === id);

const getByStatus = (status) =>
  tasks.filter((task) => task.status === status);

const getPaginated = (page, limit) => {
  // Pages are one-based, so page 1 starts at index 0.
  const offset = (page - 1) * limit;

  return tasks.slice(offset, offset + limit);
};

const getStats = () => {
  const now = new Date();
  const counts = {
    todo: 0,
    in_progress: 0,
    done: 0,
  };
  let overdue = 0;

  tasks.forEach((task) => {
    if (counts[task.status] !== undefined) {
      counts[task.status]++;
    }

    if (
      task.dueDate &&
      task.status !== 'done' &&
      new Date(task.dueDate) < now
    ) {
      overdue++;
    }
  });

  return {
    ...counts,
    overdue,
  };
};

const create = ({
  title,
  description = '',
  status = 'todo',
  priority = 'medium',
  dueDate = null,
}) => {
  const task = {
    id: uuidv4(),
    title,
    description,
    status,
    priority,
    dueDate,
    assignee: null,
    completedAt: null,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  return task;
};

const update = (id, fields) => {
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return null;
  }

  const updated = {
    ...tasks[index],
    ...fields,
  };

  tasks[index] = updated;
  return updated;
};

const remove = (id) => {
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    return false;
  }

  tasks.splice(index, 1);
  return true;
};

const completeTask = (id) => {
  const task = findById(id);

  if (!task) {
    return null;
  }

  // Completing a task should not change its existing priority.
  const updated = {
    ...task,
    status: 'done',
    completedAt: new Date().toISOString(),
  };

  const index = tasks.findIndex((item) => item.id === id);
  tasks[index] = updated;

  return updated;
};

const assign = (id, assignee) => {
  const task = findById(id);

  if (!task) {
    return null;
  }

  const updated = {
    ...task,
    assignee,
  };

  const index = tasks.findIndex((item) => item.id === id);
  tasks[index] = updated;

  return updated;
};

const _reset = () => {
  tasks = [];
};

module.exports = {
  getAll,
  findById,
  getByStatus,
  getPaginated,
  getStats,
  create,
  update,
  remove,
  completeTask,
  assign,
  _reset,
};