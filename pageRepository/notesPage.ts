import { Page, Locator, expect } from "@playwright/test";
import { Note } from "@utils/note";
import { API_MESSAGES, NOTE_CATEGORIES } from "@utils/constants";
import { User } from "@utils/user";

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
    await this.fillNoteForm(note);
    await this.createButton.click();
    await expect(this.createButton).not.toBeVisible();
  }

  async verifyNote(note: Note): Promise<void> {
    await expect(
      this.noteCardTitle.filter({ hasText: note.getTitle() }),
    ).toHaveText(note.getTitle());

    await expect(
      this.noteCardDescription.filter({ hasText: note.getDescription() }),
    ).toHaveText(note.getDescription());
  }

  async deleteNote(note: Note): Promise<void> {
    try {
      await this.noteCard
        .filter({ hasText: note.getTitle() })
        .locator(this.noteDeleteButton)
        .click();
      await this.modalDeleteButton.click();
    } catch (error) {
      throw new Error(`Failed to delete note "${note.getTitle()}": ${error}`);
    }
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
    await this.fillNoteForm(updatedNote);
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
      default:
        throw new Error(`Unknown category: ${category}`);
    }
  }

  async searchNoteByTitle(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await expect(this.noteCardTitle.filter({ hasText: query })).toBeVisible();
  }

  async openNoteDetails(note: Note): Promise<void> {
    const noteCardToView = this.noteCard.filter({
      hasText: note.getTitle(),
    });
    await noteCardToView.locator(this.noteViewButton).click();
  }

  async verifyNoteDetails(note: Note): Promise<void> {
    await expect(this.page.getByTestId("note-card-title")).toHaveText(
      note.getTitle(),
    );
    await expect(this.page.getByTestId("note-card-description")).toHaveText(
      note.getDescription(),
    );
    await expect(this.page.getByTestId("note-card-updated-at")).toHaveText(
      note.getUpdatedAt(true)!,
    );
  }

  private async fillNoteForm(note: Note): Promise<void> {
    await this.categoryDropdown.selectOption(note.getCategory());
    await this.completedCheckbox.setChecked(note.getCompleted());
    await this.titleInput.fill(note.getTitle());
    await this.descriptionInput.fill(note.getDescription());
  }
}
