export class Note {
  private id: string;
  private title: string;
  private description: string;
  private category: string;
  private completed: boolean;
  private user_id: string;
  private created_at?: string;
  private updated_at?: string;

  constructor(
    id: string,
    title: string,
    description: string,
    category: string,
    completed: boolean,
    user_id: string,
    created_at?: string,
    updated_at?: string,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.category = category;
    this.completed = completed;
    this.user_id = user_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getTitle(): string {
    return this.title;
  }

  public getDescription(): string {
    return this.description;
  }

  public getCategory(): string {
    return this.category;
  }

  public getCompleted(): boolean {
    return this.completed;
  }

  public getUserId(): string {
    return this.user_id;
  }

  public getCreatedAt(formatted?: boolean): string | undefined {
    if (!formatted) {
      return this.created_at;
    }
    return Note.formatDateString(this.created_at);
  }

  public getUpdatedAt(formatted?: boolean): string | undefined {
    if (!formatted) {
      return this.updated_at;
    }
    return Note.formatDateString(this.updated_at);
  }

  private static formatDateString(dateStr?: string): string | undefined {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return undefined;

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Use UTC getters to consider timezone GMT+0
    const month = monthNames[d.getUTCMonth()];
    const pad = (n: number) => n.toString().padStart(2, "0");

    const day = d.getUTCDate().toString();
    const year = d.getUTCFullYear();
    const hours = pad(d.getUTCHours());
    const minutes = pad(d.getUTCMinutes());
    const seconds = pad(d.getUTCSeconds());

    return `${month} ${day}, ${year} at ${hours}:${minutes}:${seconds}`;
  }

  // Setters for mutable properties used in tests
  public setTitle(title: string): void {
    this.title = title;
  }

  public setDescription(description: string): void {
    this.description = description;
  }

  public setCategory(category: string): void {
    this.category = category;
  }

  public setCompleted(completed: boolean): void {
    this.completed = completed;
  }

  /**
   * Factory method to create a Note instance from API response data
   * @param data - The note data from API response
   * @returns A new Note instance
   *
   * @example
   * const note = Note.fromResponse(body.data);
   */
  public static fromResponse(data: any): Note {
    return new Note(
      data.id,
      data.title,
      data.description,
      data.category,
      data.completed,
      data.user_id,
      data.created_at,
      data.updated_at,
    );
  }

  /**
   * Factory method to create a random Note for testing
   * @param userId - The user ID to associate with the note
   * @param category - Optional category, defaults to random selection
   * @returns A new Note instance with fake data
   *
   * @example
   * const note = await Note.createNote(user.getId(), "Work");
   */
  public static async createNote(
    userId: string,
    category?: string,
  ): Promise<Note> {
    const { faker } = await import("@faker-js/faker");
    const id = "";
    const title = faker.lorem.sentence();
    const description = faker.lorem.paragraph();
    const completed = false;
    const created_at = faker.date.past().toISOString();
    const updated_at = faker.date.recent().toISOString();
    const user_id = userId;

    return new Note(
      id,
      title,
      description,
      category ?? faker.helpers.arrayElement(["Work", "Personal", "Home"]),
      completed,
      user_id,
      created_at,
      updated_at,
    );
  }
}
