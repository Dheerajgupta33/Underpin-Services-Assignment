const express = require('express');

const router = express.Router();

const taskService = require('../services/taskService');
const {
  validateCreateTask,
  validateUpdateTask,
} = require('../utils/validators');

router.get('/stats', (req, res) => {
  const stats = taskService.getStats();

  return res.json(stats);
});

router.get('/', (req, res) => {
  const { status, page, limit } = req.query;

  if (status) {
    const tasks = taskService.getByStatus(status);

    return res.json(tasks);
  }

  if (page !== undefined || limit !== undefined) {
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const tasks = taskService.getPaginated(pageNum, limitNum);

    return res.json(tasks);
  }

  const tasks = taskService.getAll();

  return res.json(tasks);
});

router.post('/', (req, res) => {
  const error = validateCreateTask(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const task = taskService.create(req.body);

  return res.status(201).json(task);
});

router.patch('/:id/assign', (req, res) => {
  const { assignee } = req.body;

  if (typeof assignee !== 'string' || assignee.trim() === '') {
    return res.status(400).json({
      error: 'assignee must be a non-empty string',
    });
  }

  const task = taskService.assign(
    req.params.id,
    assignee.trim()
  );

  if (!task) {
    return res.status(404).json({
      error: 'Task not found',
    });
  }

  return res.json(task);
});

router.put('/:id', (req, res) => {
  const error = validateUpdateTask(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const editableFields = [
    'title',
    'description',
    'status',
    'priority',
    'dueDate',
  ];

  const fields = Object.fromEntries(
    editableFields
      .filter((field) => req.body[field] !== undefined)
      .map((field) => [field, req.body[field]])
  );

  const task = taskService.update(req.params.id, fields);

  if (!task) {
    return res.status(404).json({
      error: 'Task not found',
    });
  }

  return res.json(task);
});

router.delete('/:id', (req, res) => {
  const deleted = taskService.remove(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      error: 'Task not found',
    });
  }

  return res.status(204).send();
});

router.patch('/:id/complete', (req, res) => {
  const task = taskService.completeTask(req.params.id);

  if (!task) {
    return res.status(404).json({
      error: 'Task not found',
    });
  }

  return res.json(task);
});

module.exports = router;