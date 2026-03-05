import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phone === phone,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      id,
      fullName: insertUser.fullName,
      phone: insertUser.phone,
      password: insertUser.password,
      role: insertUser.role ?? 'TENANT',
      email: insertUser.email ?? null,
      avatar: insertUser.avatar ?? null,
      commune: insertUser.commune ?? null,
      budget: insertUser.budget ?? null,
      budgetCurrency: insertUser.budgetCurrency ?? 'GNF',
      profession: insertUser.profession ?? null,
      householdSize: insertUser.householdSize ?? null,
      completionPercent: insertUser.completionPercent ?? 0,
      pushToken: insertUser.pushToken ?? null,
      isVerified: false,
      verificationDocuments: [],
      isActive: true,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
