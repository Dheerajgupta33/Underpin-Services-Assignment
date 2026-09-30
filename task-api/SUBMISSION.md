# Submission Notes

I added unit tests for the task service and integration tests for the API routes. I found and fixed the pagination offset bug and the bug that changed a task's priority when completing it.

I added `PATCH /tasks/:id/assign`. It accepts a non-empty string, trims surrounding whitespace, returns `404` for a missing task, and allows reassignment by replacing the existing assignee.

The final test suite contains 23 tests and achieves 92.25% statement coverage.

If I had more time, I would test malformed JSON, invalid pagination values, unsupported routes, concurrent updates, and persistence failures.

