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