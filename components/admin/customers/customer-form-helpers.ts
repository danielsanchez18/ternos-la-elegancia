export type CreateCustomerFormState = {
  nombres: string;
  apellidos: string;
  email: string;
  celular: string;
  dni: string;
  password: string;
};

export const initialCreateCustomerFormState: CreateCustomerFormState = {
  nombres: "",
  apellidos: "",
  email: "",
  celular: "",
  dni: "",
  password: "",
};

export function buildCreateCustomerPayload(form: CreateCustomerFormState) {
  return {
    nombres: form.nombres.trim(),
    apellidos: form.apellidos.trim(),
    email: form.email.trim().toLowerCase(),
    celular: form.celular.trim() || undefined,
    dni: form.dni.trim(),
    password: form.password,
  };
}
