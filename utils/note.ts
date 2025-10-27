export class Note {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;

  constructor(
    id: string,
    title: string,
    description: string,
    category: string,
    completed: boolean,
    user_id: string,
    created_at?: string,
    updated_at?: string
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

  public static async createNote(userId: string): Promise<Note> {
    const { faker } = await import("@faker-js/faker");
    const id = "";
    const title = faker.lorem.sentence();
    const description = faker.lorem.paragraph();
    const category = faker.helpers.arrayElement(["Work", "Personal", "Home"]);
    const completed = false; // faker.datatype.boolean();
    const created_at = faker.date.past().toISOString();
    const updated_at = faker.date.recent().toISOString();
    const user_id = userId;

    return new Note(
      id,
      title,
      description,
      category,
      completed,
      user_id,
      created_at,
      updated_at
    );
  }
}
