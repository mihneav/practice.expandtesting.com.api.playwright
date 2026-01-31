import { Page, Locator, expect } from "@playwright/test";
import { Note } from "@utils/note";
import { NOTE_CATEGORIES } from "@utils/constants";

export class NotesPage {
  readonly page: Page;
  readonly home: Locator;
  readonly logout: Locator;
  readonly addNewNoteButton: Locator;
  readonly categoryDropdown: Locator;
  readonly completedCheckbox: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessages: Locator;
  readonly noteCard: Locator;
  readonly noteCardTitle: Locator;
  readonly noteCardDescription: Locator;
  readonly noteViewButton: Locator;
  readonly noteEditButton: Locator;
  readonly noteDeleteButton: Locator;
  readonly modalDeleteButton: Locator;
  readonly homeCategory: Locator;
  readonly workCategory: Locator;
  readonly personalCategory: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly modal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.home = page.getByTestId("home");
    this.logout = page.getByTestId("logout");
    this.addNewNoteButton = page.getByTestId("add-new-note");
    this.categoryDropdown = page.getByTestId("note-category");
    this.completedCheckbox = page.getByTestId("note-completed");
    this.titleInput = page.getByTestId("note-title");
    this.descriptionInput = page.getByTestId("note-description");
    this.errorMessages = page.locator(".invalid-feedback");
    this.createButton = page.getByTestId("note-submit");
    this.cancelButton = page.getByTestId("note-cancel");
    this.noteCard = page.getByTestId("note-card");
    this.noteCardTitle = page.getByTestId("note-card-title");
    this.noteCardDescription = page.getByTestId("note-card-description");
    this.noteViewButton = page.getByTestId("note-view");
    this.noteEditButton = page.getByTestId("note-edit");
    this.noteDeleteButton = page.getByTestId("note-delete");
    this.modalDeleteButton = page.getByTestId("note-delete-confirm");
    this.homeCategory = page.getByTestId("category-home");
    this.workCategory = page.getByTestId("category-work");
    this.personalCategory = page.getByTestId("category-personal");
    this.searchInput = page.getByTestId("search-input");
    this.searchButton = page.getByTestId("search-btn");
    this.modal = page.getByTestId("modal-content");
  }

  async gotoNotes(): Promise<void> {
    await this.page.goto("/notes/app/");
  }

  async expectLogoutVisible(): Promise<void> {
    await expect(this.logout).toBeVisible();
  }

  async openAddNoteModal(): Promise<void> {
    await this.addNewNoteButton.click();
  }

  async addNewNote(note: Note): Promise<void> {
    await this.openAddNoteModal();
    await this.categoryDropdown.selectOption(note.getCategory());
    if (note.getCompleted()) {
      await this.completedCheckbox.check();
    } else {
      await this.completedCheckbox.uncheck();
    }
    await this.titleInput.fill(note.getTitle());
    await this.descriptionInput.fill(note.getDescription());
    await this.createButton.click();
    await expect(this.createButton).not.toBeVisible();
  }

  async verifyNoteAdded(note: Note): Promise<void> {
    await expect(this.modal).not.toBeVisible();
    await expect(
      this.noteCard
        .filter({ hasText: note.getTitle() })
        .locator(this.noteCardTitle),
    ).toHaveText(note.getTitle());

    await expect(
      this.noteCard
        .filter({ hasText: note.getDescription() })
        .locator(this.noteCardDescription),
    ).toHaveText(note.getDescription());
  }

  async deleteNote(note: Note): Promise<void> {
    await this.verifyNoteAdded(note);
    await this.noteCard
      .filter({ hasText: note.getTitle() })
      .locator(this.noteDeleteButton)
      .click();
    await this.modalDeleteButton.click();
  }

  async submitNoteForm(): Promise<void> {
    await this.createButton.click();
  }

  async verifyNoteValidationErrors(expectedErrors: string[]): Promise<void> {
    await expect(this.errorMessages).toHaveCount(expectedErrors.length + 1); // +1 for the hidden element
    for (let i = 1; i < expectedErrors.length - 1; i++) {
      await expect(this.errorMessages.nth(i)).toHaveText(expectedErrors[i]);
    }
  }

  async editNote(oldNote: Note, updatedNote: Note): Promise<void> {
    const noteCardToEdit = this.noteCard.filter({
      hasText: oldNote.getTitle(),
    });

    await noteCardToEdit.locator(this.noteEditButton).click();
    await this.categoryDropdown.selectOption(updatedNote.getCategory());
    if (updatedNote.getCompleted()) {
      await this.completedCheckbox.check();
    } else {
      await this.completedCheckbox.uncheck();
    }
    await this.titleInput.fill(updatedNote.getTitle());
    await this.descriptionInput.fill(updatedNote.getDescription());
    await this.createButton.click();
    await expect(this.createButton).not.toBeVisible();
  }

  async verifyNoteDeleted(note: Note): Promise<void> {
    const noteCardToVerify = this.noteCard.getByText(note.getTitle());
    await expect(noteCardToVerify).toHaveCount(0);
  }

  async filterByCategory(category: string): Promise<void> {
    switch (category) {
      case NOTE_CATEGORIES.WORK:
        await this.workCategory.click();
        break;
      case NOTE_CATEGORIES.PERSONAL:
        await this.personalCategory.click();
        break;
      case NOTE_CATEGORIES.HOME:
        await this.homeCategory.click();
        break;
    }
  }

  async searchNoteByTitle(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click();
  }
}
