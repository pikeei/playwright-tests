import { expect, test } from '@playwright/test';
import { TodoPage } from './todo-page';

const TODOS = ['buy some cheese', 'feed the cat', 'book a doctors appointment'];

test.beforeEach(async ({ page }) => {
  const todoPage = new TodoPage(page);
  await todoPage.goto();
});

test.describe('Adding todos', () => {
  test('starts with an empty list', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await expect(todoPage.todoItems).toHaveCount(0);
  });

  test('adds a single todo and clears the input', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addTodos([TODOS[0]]);
    await todoPage.expectTodoTitles([TODOS[0]]);
    await expect(todoPage.newTodoInput).toBeEmpty();
  });

  test('adds multiple todos and shows the count', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addTodos(TODOS);
    await todoPage.expectTodoTitles(TODOS);
    await todoPage.expectCount('3 items left');
  });

  test('trims whitespace around new todos', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addTodos(['    buy some cheese   ']);
    await todoPage.expectTodoTitles(['buy some cheese']);
  });
});

test.describe('Completing and deleting', () => {
  test.beforeEach(async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addTodos(TODOS);
  });

  test('marks a todo as completed', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const first = todoPage.todoItems.first();
    await todoPage.markTodoComplete(0);
    await expect(first).toHaveClass(/completed/);
    await todoPage.expectCount('2 items left');
  });

  test('un-completes a todo', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const first = todoPage.todoItems.first();
    await todoPage.markTodoComplete(0);
    await todoPage.markTodoIncomplete(0);
    await expect(first).not.toHaveClass(/completed/);
  });

  test('"mark all as complete" completes everything', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.markAllComplete();
    await expect(todoPage.todoItems).toHaveClass(['completed', 'completed', 'completed']);
  });

  test('deletes a todo', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.deleteTodo(1);
    await todoPage.expectTodoTitles([TODOS[0], TODOS[2]]);
  });

  test('"Clear completed" removes only completed todos', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.markTodoComplete(0);
    await todoPage.clearCompleted();
    await todoPage.expectTodoTitles([TODOS[1], TODOS[2]]);
  });
});

test.describe('Editing', () => {
  test('edits a todo by double-clicking it', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addTodos(TODOS);
    await todoPage.editTodo(1, 'buy some sausages');
    await todoPage.expectTodoTitles([TODOS[0], 'buy some sausages', TODOS[2]]);
  });

  test('pressing Escape cancels an edit', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addTodos(TODOS);
    await todoPage.cancelEdit(1, 'this will be discarded');
    await todoPage.expectTodoTitles(TODOS);
  });
});

test.describe('Filters and persistence', () => {
  test.beforeEach(async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.addTodos(TODOS);
    await todoPage.markTodoComplete(1);
  });

  test('Active filter shows only incomplete todos', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.filter('Active');
    await todoPage.expectTodoTitles([TODOS[0], TODOS[2]]);
  });

  test('Completed filter shows only completed todos', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.filter('Completed');
    await todoPage.expectTodoTitles([TODOS[1]]);
  });

  test('All filter shows everything again', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await todoPage.filter('Completed');
    await todoPage.filter('All');
    await todoPage.expectTodoTitles(TODOS);
  });

  test('todos survive a page reload (localStorage)', async ({ page }) => {
    const todoPage = new TodoPage(page);
    await page.reload();
    await todoPage.expectTodoTitles(TODOS);
    await expect(todoPage.todoItems.nth(1)).toHaveClass(/completed/);
  });
});
