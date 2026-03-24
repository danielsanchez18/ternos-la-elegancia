import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  CreateCustomerFileInput,
  CreateCustomerNoteInput,
  PublicCustomerFile,
  PublicCustomerNote,
  UpdateCustomerFileInput,
  UpdateCustomerNoteInput,
} from "@/src/modules/customers/domain/customer-records.types";

const publicCustomerNoteSelect = {
  id: true,
  customerId: true,
  adminUserId: true,
  note: true,
  createdAt: true,
} satisfies Prisma.CustomerNoteSelect;

const publicCustomerFileSelect = {
  id: true,
  customerId: true,
  fileName: true,
  fileUrl: true,
  mimeType: true,
  description: true,
  createdAt: true,
} satisfies Prisma.CustomerFileSelect;

export class CustomerRecordsRepository {
  async customerExists(customerId: string): Promise<boolean> {
    const row = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    return Boolean(row);
  }

  async adminUserExists(adminUserId: string): Promise<boolean> {
    const row = await prisma.adminUser.findUnique({
      where: { id: adminUserId },
      select: { id: true },
    });

    return Boolean(row);
  }

  async listNotesByCustomerId(customerId: string): Promise<PublicCustomerNote[]> {
    return prisma.customerNote.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      select: publicCustomerNoteSelect,
    });
  }

  async createNote(
    customerId: string,
    input: CreateCustomerNoteInput
  ): Promise<PublicCustomerNote> {
    return prisma.customerNote.create({
      data: {
        customerId,
        adminUserId: input.adminUserId,
        note: input.note,
      },
      select: publicCustomerNoteSelect,
    });
  }

  async getNoteById(noteId: string): Promise<PublicCustomerNote | null> {
    return prisma.customerNote.findUnique({
      where: { id: noteId },
      select: publicCustomerNoteSelect,
    });
  }

  async updateNoteById(
    noteId: string,
    input: UpdateCustomerNoteInput
  ): Promise<PublicCustomerNote> {
    return prisma.customerNote.update({
      where: { id: noteId },
      data: {
        note: input.note,
        adminUserId: input.adminUserId,
      },
      select: publicCustomerNoteSelect,
    });
  }

  async deleteNoteById(noteId: string): Promise<void> {
    await prisma.customerNote.delete({ where: { id: noteId } });
  }

  async listFilesByCustomerId(customerId: string): Promise<PublicCustomerFile[]> {
    return prisma.customerFile.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      select: publicCustomerFileSelect,
    });
  }

  async createFile(
    customerId: string,
    input: CreateCustomerFileInput
  ): Promise<PublicCustomerFile> {
    return prisma.customerFile.create({
      data: {
        customerId,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        mimeType: input.mimeType,
        description: input.description,
      },
      select: publicCustomerFileSelect,
    });
  }

  async getFileById(fileId: string): Promise<PublicCustomerFile | null> {
    return prisma.customerFile.findUnique({
      where: { id: fileId },
      select: publicCustomerFileSelect,
    });
  }

  async updateFileById(
    fileId: string,
    input: UpdateCustomerFileInput
  ): Promise<PublicCustomerFile> {
    return prisma.customerFile.update({
      where: { id: fileId },
      data: {
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        mimeType: input.mimeType,
        description: input.description,
      },
      select: publicCustomerFileSelect,
    });
  }

  async deleteFileById(fileId: string): Promise<void> {
    await prisma.customerFile.delete({ where: { id: fileId } });
  }
}
