import { Note } from "./note";

/**
 * Represents a user in the system with authentication and profile information
 */
export class User {
  private readonly firstName: string;
  private readonly lastName: string;
  private readonly email: string;
  private password: string;
  private phone: string;
  private company: string;
  private username: string;
  private token: string;
  private id: string;
  private notes: Note[] = [];

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone: string,
    company: string,
    username: string,
    token: string = "",
    id: string = "",
    notes: Note[] = [],
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.company = company;
    this.username = username;
    this.token = token;
    this.id = id;
    this.notes = notes;
  }

  /**
   * Creates a new user with randomly generated fake data for testing
   * @returns Promise resolving to a new User instance
   */
  public static async createUser(): Promise<User> {
    const { faker } = await import("@faker-js/faker");

    const firstName = faker.person.firstName().toLowerCase();
    const lastName = faker.person.lastName().toLowerCase();

    return new User(
      firstName,
      lastName,
      faker.internet.email({ firstName, lastName }),
      faker.internet.password({ length: 10 }),
      faker.phone.number({ style: "international" }),
      faker.company.name(),
      faker.internet.username({ firstName, lastName }).substring(0, 29),
    );
  }

  public addNote(note: Note): void {
    this.notes.push(note);
  }

  public clearNotes(): void {
    this.notes = [];
  }

  public removeNote(note: Note): void {
    this.notes = this.notes.filter((n) => n.getId() !== note.getId());
  }

  // Getters
  public getFirstName(): string {
    return this.firstName;
  }

  public getFullName(): string {
    return `${this.firstName}${this.lastName}`;
  }

  public getEmail(): string {
    return this.email;
  }

  public setPassword(password: string): void {
    this.password = password;
  }
  public getPassword(): string {
    return this.password;
  }

  public getPhone(): string {
    return this.phone;
  }

  public getCompany(): string {
    return this.company;
  }

  public getToken(): string {
    return this.token;
  }

  public getId(): string {
    return this.id;
  }

  public getNotes(): Note[] {
    return this.notes;
  }

  // Setters for mutable properties
  public setToken(token: string): void {
    this.token = token;
  }

  public clearAuthToken(): void {
    this.token = "";
  }

  public setId(id: string): void {
    this.id = id;
  }
}
