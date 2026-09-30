const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

beforeEach(() => {
  taskService._reset();
});

test('GET /tasks returns an empty list', async () => {
  const response = await request(app)
    .get('/tasks')
    .expect(200);

  expect(response.body).toEqual([]);
});

test('POST /tasks creates a task', async () => {
  const response = await request(app)
    .post('/tasks')
    .send({
      title: 'Write integration tests',
      priority: 'high',
    })
    .expect(201);

  expect(response.body.title).toBe('Write integration tests');
  expect(response.body.priority).toBe('high');
  expect(response.body.status).toBe('todo');
  expect(response.body.id).toEqual(expect.any(String));
});

test('POST /tasks rejects an empty title', async () => {
  const response = await request(app)
    .post('/tasks')
    .send({ title: '   ' })
    .expect(400);

  expect(response.body.error).toBe(
    'title is required and must be a non-empty string'
  );
});

test('POST /tasks rejects an invalid priority', async () => {
  await request(app)
    .post('/tasks')
    .send({
      title: 'Invalid task',
      priority: 'urgent',
    })
    .expect(400);
});

test('GET /tasks filters by status', async () => {
  taskService.create({ title: 'Todo task', status: 'todo' });
  taskService.create({ title: 'Done task', status: 'done' });

  const response = await request(app)
    .get('/tasks?status=todo')
    .expect(200);

  expect(response.body).toHaveLength(1);
  expect(response.body[0].title).toBe('Todo task');
});

test('GET /tasks supports pagination', async () => {
  taskService.create({ title: 'Task 1' });
  taskService.create({ title: 'Task 2' });
  taskService.create({ title: 'Task 3' });

  const response = await request(app)
    .get('/tasks?page=1&limit=2')
    .expect(200);

  expect(response.body.map((task) => task.title)).toEqual([
    'Task 1',
    'Task 2',
  ]);
});

test('PUT /tasks/:id updates a task', async () => {
  const task = taskService.create({ title: 'Old title' });

  const response = await request(app)
    .put(`/tasks/${task.id}`)
    .send({ title: 'New title' })
    .expect(200);

  expect(response.body.title).toBe('New title');
  expect(response.body.id).toBe(task.id);
});

test('PUT /tasks/:id returns 404 for a missing task', async () => {
  await request(app)
    .put('/tasks/missing-id')
    .send({ title: 'Updated' })
    .expect(404);
});

test('DELETE /tasks/:id deletes a task', async () => {
  const task = taskService.create({ title: 'Delete me' });

  await request(app)
    .delete(`/tasks/${task.id}`)
    .expect(204);

  expect(taskService.findById(task.id)).toBeUndefined();
});

test('DELETE /tasks/:id returns 404 for a missing task', async () => {
  await request(app)
    .delete('/tasks/missing-id')
    .expect(404);
});

test('PATCH /tasks/:id/complete completes a task', async () => {
  const task = taskService.create({
    title: 'Complete me',
    priority: 'high',
  });

  const response = await request(app)
    .patch(`/tasks/${task.id}/complete`)
    .expect(200);

  expect(response.body.status).toBe('done');
  expect(response.body.priority).toBe('high');
  expect(response.body.completedAt).toEqual(expect.any(String));
});

test('PATCH /tasks/:id/complete returns 404 for a missing task', async () => {
  await request(app)
    .patch('/tasks/missing-id/complete')
    .expect(404);
});

test('GET /tasks/stats returns task counts', async () => {
  taskService.create({ title: 'Todo task', status: 'todo' });
  taskService.create({ title: 'Done task', status: 'done' });

  const response = await request(app)
    .get('/tasks/stats')
    .expect(200);

  expect(response.body).toEqual({
    todo: 1,
    in_progress: 0,
    done: 1,
    overdue: 0,
  });
});