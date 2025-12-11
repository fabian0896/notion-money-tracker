import { ACCOUNTS_DATABASE_ID, CATEGORIES_DATABASE_ID, COMPANIES_DATABASE_ID, CONTACTS_DTABASE_ID, MONTH_DATABASE_ID, TRANSACTIONS_DATABASE_ID } from "../constants/databases";
import { emoji, id, title, number, date, select, relation, richText, phoneNumber, email } from "../lib/notion-db";
import { defineNotionTable } from "../lib/notion-db/notion-db";

export const categoriesTable = defineNotionTable(CATEGORIES_DATABASE_ID, {
  id: id(),
  icon: emoji(),
  name: title('Nombre'),
  type: select("Tipo 1", ["Gasto", "Ingreso", "Transferencia"] as const),
});

export const transactionsTable = defineNotionTable(TRANSACTIONS_DATABASE_ID, {
  id: id(),
  amount: number("Valor"),
  date: date("Fecha"),
  type: select("Tipo de Transaccion", ["Gasto", "Ingreso", "Transferencia"] as const),
  description: title("Descripción Comercio"),
  account: relation("Cuentas"),
  category: relation("Categorías"),
  month: relation("Mes"),
  destination: relation("Destino"),
});

export const monthsTable = defineNotionTable(MONTH_DATABASE_ID, {
  id: id(),
  name: title("Nombre"),
});

export const accountsTable = defineNotionTable(ACCOUNTS_DATABASE_ID, {
  id: id(),
  name: title("Cuenta"),
  wallet: richText('Nombre Tarjeta'),
});

export const clientsTable = defineNotionTable(COMPANIES_DATABASE_ID, {
  id: id(),
  name: title('Nombre'),
});

export const contactsTable = defineNotionTable(CONTACTS_DTABASE_ID, {
  id: id(),
  name: title('Nombre'),
  phone_number: phoneNumber('Teléfono'),
  email: email('Correo electrónico'),
  company: relation('Empresa'),
});