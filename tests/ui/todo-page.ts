import { Locator, Page, expect } from '@playwright/test';

export class TodoPage {
  readonly page: Page;
  readonly newTodoInput: Locator;
  readonly todoItems: Locator;
  readonly todoTitles: Locator;
  readonly todoCount: Locator;
  readonly clearCompletedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.todoItems = page.getByTestId('todo-item');
    this.todoTitles = page.getByTestId('todo-title');
    this.todoCount = page.getByTestId('todo-count');
    this.clearCompletedButton = page.getByRole('button', { name: 'Clear completed' });
  }

  async goto() {
    await this.page.goto('/todomvc');
  }

  async addTodo(text: string) {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }

  async addTodos(items: string[]) {
    for (const item of items) {
      await this.addTodo(item);
    }
  }

  async markTodoComplete(index: number) {
    await this.todoItems.nth(index).getByRole('checkbox').check();
  }

  async markTodoIncomplete(index: number) {
    await this.todoItems.nth(index).getByRole('checkbox').uncheck();
  }

  async deleteTodo(index: number) {
    const item = this.todoItems.nth(index);
    await item.hover();
    await item.locator('.destroy').click();
  }

  async clearCompleted() {
    await this.clearCompletedButton.click();
  }

  async filter(name: 'All' | 'Active' | 'Completed') {
    await this.page.getByRole('link', { name }).click();
  }

  async markAllComplete() {
    await this.page.getByLabel('Mark all as complete').check();
  }

  async editTodo(index: number, newText: string) {
    const item = this.todoItems.nth(index);
    await item.getByTestId('todo-title').dblclick();
    const editor = item.getByRole('textbox', { name: 'Edit' });
    await editor.fill(newText);
    await editor.press('Enter');
  }

  async cancelEdit(index: number, newText: string) {
    const item = this.todoItems.nth(index);
    await item.getByTestId('todo-title').dblclick();
    const editor = item.getByRole('textbox', { name: 'Edit' });
    await editor.fill(newText);
    await editor.press('Escape');
  }

  async expectTodoTitles(expectedTitles: string[]) {
    await expect(this.todoTitles).toHaveText(expectedTitles);
  }

  async expectCount(expectedCountText: string) {
    await expect(this.todoCount).toHaveText(expectedCountText);
  }
}
