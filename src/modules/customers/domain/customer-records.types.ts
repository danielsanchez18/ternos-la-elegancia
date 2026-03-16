export type PublicCustomerNote = {
  id: number;
  customerId: number;
  adminUserId: number | null;
  note: string;
  createdAt: Date;
};

export type PublicCustomerFile = {
  id: number;
  customerId: number;
  fileName: string;
  fileUrl: string;
  mimeType: string | null;
  description: string | null;
  createdAt: Date;
};

export type CreateCustomerNoteInput = {
  note: string;
  adminUserId?: number | null;
};

export type UpdateCustomerNoteInput = {
  note?: string;
  adminUserId?: number | null;
};

export type CreateCustomerFileInput = {
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  description?: string;
};

export type UpdateCustomerFileInput = {
  fileName?: string;
  fileUrl?: string;
  mimeType?: string | null;
  description?: string | null;
};
