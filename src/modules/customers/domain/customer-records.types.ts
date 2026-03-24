export type PublicCustomerNote = {
  id: string;
  customerId: string;
  adminUserId: string | null;
  note: string;
  createdAt: Date;
};

export type PublicCustomerFile = {
  id: string;
  customerId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string | null;
  description: string | null;
  createdAt: Date;
};

export type CreateCustomerNoteInput = {
  note: string;
  adminUserId?: string | null;
};

export type UpdateCustomerNoteInput = {
  note?: string;
  adminUserId?: string | null;
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
