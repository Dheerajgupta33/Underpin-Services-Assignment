const taskService = require('../src/services/taskService');

beforeEach(() => {
  taskService._reset();
});

test('creates a task with default values', () => {
  const task = taskService.create({
    title: 'Study Jest',
  });

  expect(task.title).toBe('Study Jest');
  expect(task.status).toBe('todo');
  expect(task.priority).toBe('medium');
  expect(task.dueDate).toBeNull();
  expect(task.completedAt).toBeNull();
});

test('pagination returns the first page correctly', () => {
  taskService.create({ title: 'Task 1' });
  taskService.create({ title: 'Task 2' });
  taskService.create({ title: 'Task 3' });

  const result = taskService.getPaginated(1, 2);

  expect(result.map((task) => task.title)).toEqual([
    'Task 1',
    'Task 2',
  ]);
});

test('completing a task preserves its priority', () => {
  const task = taskService.create({
    title: 'Important task',
    priority: 'high',
  });

  const completed = taskService.completeTask(task.id);

  expect(completed.status).toBe('done');
  expect(completed.completedAt).toEqual(expect.any(String));
  expect(completed.priority).toBe('high');
});

test('filters by exact status', () => {
  taskService.create({
    title: 'Todo task',
    status: 'todo',
  });

  taskService.create({
    title: 'Done task',
    status: 'done',
  });

  const result = taskService.getByStatus('todo');

  expect(result).toHaveLength(1);
  expect(result[0].title).toBe('Todo task');
});

test('returns null when updating a missing task', () => {
  const result = taskService.update('missing-id', {
    title: 'Updated',
  });

  expect(result).toBeNull();
});