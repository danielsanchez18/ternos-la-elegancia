import {
  CustomerFileNotFoundError,
  CustomerNoteNotFoundError,
  CustomerRecordRelatedEntityNotFoundError,
} from "@/src/modules/customers/domain/customer-records.errors";
import {
  CreateCustomerFileInput,
  CreateCustomerNoteInput,
  PublicCustomerFile,
  PublicCustomerNote,
  UpdateCustomerFileInput,
  UpdateCustomerNoteInput,
} from "@/src/modules/customers/domain/customer-records.types";
import { CustomerRecordsRepository } from "@/src/modules/customers/infrastructure/customer-records.repository";

export class CustomerRecordsService {
  constructor(private readonly repository: CustomerRecordsRepository = new CustomerRecordsRepository()) {}

  async listNotesByCustomerId(customerId: number): Promise<PublicCustomerNote[]> {
    await this.ensureCustomerExists(customerId);
    return this.repository.listNotesByCustomerId(customerId);
  }

  async createNote(
    customerId: number,
    input: CreateCustomerNoteInput
  ): Promise<PublicCustomerNote> {
    await this.ensureCustomerExists(customerId);

    if (typeof input.adminUserId === "number") {
      const exists = await this.repository.adminUserExists(input.adminUserId);
      if (!exists) {
        throw new CustomerRecordRelatedEntityNotFoundError("adminUser");
      }
    }

    return this.repository.createNote(customerId, input);
  }

  async deleteNote(noteId: number): Promise<void> {
    const note = await this.repository.getNoteById(noteId);
    if (!note) {
      throw new CustomerNoteNotFoundError();
    }

    await this.repository.deleteNoteById(noteId);
  }

  async updateNote(noteId: number, input: UpdateCustomerNoteInput): Promise<PublicCustomerNote> {
    const note = await this.repository.getNoteById(noteId);
    if (!note) {
      throw new CustomerNoteNotFoundError();
    }

    if (typeof input.adminUserId === "number") {
      const exists = await this.repository.adminUserExists(input.adminUserId);
      if (!exists) {
        throw new CustomerRecordRelatedEntityNotFoundError("adminUser");
      }
    }

    return this.repository.updateNoteById(noteId, input);
  }

  async listFilesByCustomerId(customerId: number): Promise<PublicCustomerFile[]> {
    await this.ensureCustomerExists(customerId);
    return this.repository.listFilesByCustomerId(customerId);
  }

  async createFile(
    customerId: number,
    input: CreateCustomerFileInput
  ): Promise<PublicCustomerFile> {
    await this.ensureCustomerExists(customerId);
    return this.repository.createFile(customerId, input);
  }

  async updateFile(fileId: number, input: UpdateCustomerFileInput): Promise<PublicCustomerFile> {
    const file = await this.repository.getFileById(fileId);
    if (!file) {
      throw new CustomerFileNotFoundError();
    }

    return this.repository.updateFileById(fileId, input);
  }

  async deleteFile(fileId: number): Promise<void> {
    const file = await this.repository.getFileById(fileId);
    if (!file) {
      throw new CustomerFileNotFoundError();
    }

    await this.repository.deleteFileById(fileId);
  }

  private async ensureCustomerExists(customerId: number): Promise<void> {
    const exists = await this.repository.customerExists(customerId);

    if (!exists) {
      throw new CustomerRecordRelatedEntityNotFoundError("customer");
    }
  }
}
