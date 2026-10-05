import { test, expect, Page } from '@playwright/test';

const TODOS = ['buy some cheese', 'feed the cat', 'book a doctors appointment'];

async function addTodos(page: Page, items: string[]) {
  const input = page.getByPlaceholder('What needs to be done?');
  for (const item of items) {
    await input.fill(item);
    await input.press('Enter');
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/todomvc');
});

test.describe('Adding todos', () => {
  test('starts with an empty list', async ({ page }) => {
    await expect(page.getByTestId('todo-item')).toHaveCount(0);
  });

  test('adds a single todo and clears the input', async ({ page }) => {
    await addTodos(page, [TODOS[0]]);
    await expect(page.getByTestId('todo-title')).toHaveText([TODOS[0]]);
    await expect(page.getByPlaceholder('What needs to be done?')).toBeEmpty();
  });

  test('adds multiple todos and shows the count', async ({ page }) => {
    await addTodos(page, TODOS);
    await expect(page.getByTestId('todo-title')).toHaveText(TODOS);
    await expect(page.getByTestId('todo-count')).toHaveText('3 items left');
  });

  test('trims whitespace around new todos', async ({ page }) => {
    await addTodos(page, ['    buy some cheese   ']);
    await expect(page.getByTestId('todo-title')).toHaveText(['buy some cheese']);
  });
});

test.describe('Completing and deleting', () => {
  test.beforeEach(async ({ page }) => addTodos(page, TODOS));

  test('marks a todo as completed', async ({ page }) => {
    const first = page.getByTestId('todo-item').first();
    await first.getByRole('checkbox').check();
    await expect(first).toHaveClass(/completed/);
    await expect(page.getByTestId('todo-count')).toHaveText('2 items left');
  });

  test('un-completes a todo', async ({ page }) => {
    const first = page.getByTestId('todo-item').first();
    await first.getByRole('checkbox').check();
    await first.getByRole('checkbox').uncheck();
    await expect(first).not.toHaveClass(/completed/);
  });

  test('"mark all as complete" completes everything', async ({ page }) => {
    await page.getByLabel('Mark all as complete').check();
    await expect(page.getByTestId('todo-item')).toHaveClass(['completed', 'completed', 'completed']);
  });

  test('deletes a todo', async ({ page }) => {
    const second = page.getByTestId('todo-item').nth(1);
    await second.hover();
    await second.locator('.destroy').click();
    await expect(page.getByTestId('todo-title')).toHaveText([TODOS[0], TODOS[2]]);
  });

  test('"Clear completed" removes only completed todos', async ({ page }) => {
    await page.getByTestId('todo-item').first().getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Clear completed' }).click();
    await expect(page.getByTestId('todo-title')).toHaveText([TODOS[1], TODOS[2]]);
  });
});

test.describe('Editing', () => {
  test('edits a todo by double-clicking it', async ({ page }) => {
    await addTodos(page, TODOS);
    const item = page.getByTestId('todo-item').nth(1);
    await item.getByTestId('todo-title').dblclick();
    const editor = item.getByRole('textbox', { name: 'Edit' });
    await editor.fill('buy some sausages');
    await editor.press('Enter');
    await expect(page.getByTestId('todo-title')).toHaveText([TODOS[0], 'buy some sausages', TODOS[2]]);
  });

  test('pressing Escape cancels an edit', async ({ page }) => {
    await addTodos(page, TODOS);
    const item = page.getByTestId('todo-item').nth(1);
    await item.getByTestId('todo-title').dblclick();
    const editor = item.getByRole('textbox', { name: 'Edit' });
    await editor.fill('this will be discarded');
    await editor.press('Escape');
    await expect(page.getByTestId('todo-title')).toHaveText(TODOS);
  });
});

test.describe('Filters and persistence', () => {
  test.beforeEach(async ({ page }) => {
    await addTodos(page, TODOS);
    await page.getByTestId('todo-item').nth(1).getByRole('checkbox').check();
  });

  test('Active filter shows only incomplete todos', async ({ page }) => {
    await page.getByRole('link', { name: 'Active' }).click();
    await expect(page.getByTestId('todo-title')).toHaveText([TODOS[0], TODOS[2]]);
  });

  test('Completed filter shows only completed todos', async ({ page }) => {
    await page.getByRole('link', { name: 'Completed' }).click();
    await expect(page.getByTestId('todo-title')).toHaveText([TODOS[1]]);
  });

  test('All filter shows everything again', async ({ page }) => {
    await page.getByRole('link', { name: 'Completed' }).click();
    await page.getByRole('link', { name: 'All' }).click();
    await expect(page.getByTestId('todo-title')).toHaveText(TODOS);
  });

  test('todos survive a page reload (localStorage)', async ({ page }) => {
    await page.reload();
    await expect(page.getByTestId('todo-title')).toHaveText(TODOS);
    await expect(page.getByTestId('todo-item').nth(1)).toHaveClass(/completed/);
  });
});
