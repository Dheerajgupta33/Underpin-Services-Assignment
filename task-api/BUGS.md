# Bug Report

## Pagination skipped the first page

- Expected: `GET /tasks?page=1&limit=2` should return the first two tasks.
- Actual: The original implementation used `page * limit`, so page 1 skipped the first two tasks.
- Discovery: A unit test created three tasks and requested page 1 with a limit of 2.
- Fix: Changed the offset to `(page - 1) * limit`.

## Completing a task changed priority

- Expected: Completing a task should preserve its original priority.
- Actual: The original implementation changed every completed task's priority to `medium`.
- Discovery: A test completed a high-priority task and checked its priority.
- Fix: Removed the priority mutation from `completeTask`.

## PUT accepted protected fields

- Expected: Clients should update only editable task fields.
- Actual: The original route passed the entire request body to the service.
- Fix: Added an allowlist for editable fields.