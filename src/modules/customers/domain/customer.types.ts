export type PublicCustomer = {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  celular: string | null;
  dni: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCustomerInput = {
  nombres: string;
  apellidos: string;
  email: string;
  celular?: string;
  dni: string;
  password: string;
};

export type UpdateCustomerInput = {
  nombres?: string;
  apellidos?: string;
  email?: string;
  celular?: string | null;
  dni?: string;
  password?: string;
  isActive?: boolean;
};
