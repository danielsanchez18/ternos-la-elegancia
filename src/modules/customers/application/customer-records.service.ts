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

  async listNotesByCustomerId(customerId: string): Promise<PublicCustomerNote[]> {
    await this.ensureCustomerExists(customerId);
    return this.repository.listNotesByCustomerId(customerId);
  }

  async createNote(
    customerId: string,
    input: CreateCustomerNoteInput
  ): Promise<PublicCustomerNote> {
    await this.ensureCustomerExists(customerId);

    if (typeof input.adminUserId === "string") {
      const exists = await this.repository.adminUserExists(input.adminUserId);
      if (!exists) {
        throw new CustomerRecordRelatedEntityNotFoundError("adminUser");
      }
    }

    return this.repository.createNote(customerId, input);
  }

  async deleteNote(noteId: string): Promise<void> {
    const note = await this.repository.getNoteById(noteId);
    if (!note) {
      throw new CustomerNoteNotFoundError();
    }

    await this.repository.deleteNoteById(noteId);
  }

  async updateNote(noteId: string, input: UpdateCustomerNoteInput): Promise<PublicCustomerNote> {
    const note = await this.repository.getNoteById(noteId);
    if (!note) {
      throw new CustomerNoteNotFoundError();
    }

    if (typeof input.adminUserId === "string") {
      const exists = await this.repository.adminUserExists(input.adminUserId);
      if (!exists) {
        throw new CustomerRecordRelatedEntityNotFoundError("adminUser");
      }
    }

    return this.repository.updateNoteById(noteId, input);
  }

  async listFilesByCustomerId(customerId: string): Promise<PublicCustomerFile[]> {
    await this.ensureCustomerExists(customerId);
    return this.repository.listFilesByCustomerId(customerId);
  }

  async createFile(
    customerId: string,
    input: CreateCustomerFileInput
  ): Promise<PublicCustomerFile> {
    await this.ensureCustomerExists(customerId);
    return this.repository.createFile(customerId, input);
  }

  async updateFile(fileId: string, input: UpdateCustomerFileInput): Promise<PublicCustomerFile> {
    const file = await this.repository.getFileById(fileId);
    if (!file) {
      throw new CustomerFileNotFoundError();
    }

    return this.repository.updateFileById(fileId, input);
  }

  async deleteFile(fileId: string): Promise<void> {
    const file = await this.repository.getFileById(fileId);
    if (!file) {
      throw new CustomerFileNotFoundError();
    }

    await this.repository.deleteFileById(fileId);
  }

  private async ensureCustomerExists(customerId: string): Promise<void> {
    const exists = await this.repository.customerExists(customerId);

    if (!exists) {
      throw new CustomerRecordRelatedEntityNotFoundError("customer");
    }
  }
}
