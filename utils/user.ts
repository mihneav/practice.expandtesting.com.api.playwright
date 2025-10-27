import { Note } from "./note";

export class User {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;
  phone: string;
  company: string;
  username: string;
  token: string;
  id: string;
  notes: Note[] = [];

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
    notes: Note[] = []
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
      faker.internet.username({ firstName, lastName }).substring(0, 29)
    );
  }

  public addNote(note: Note): void {
    this.notes.push(note);
  }
}
