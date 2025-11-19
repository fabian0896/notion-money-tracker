import { ACCOUNTS_DATABASE_ID, CATEGORIES_DATABASE_ID, MONTH_DATABASE_ID, TRANSACTIONS_DATABASE_ID } from "../constants/databases";
import { emoji, id, title, number, date, select, relation, richText } from "../lib/notion-db";
import { defineNotionTable } from "../lib/notion-db/notion-db";

export const categoriesTable = defineNotionTable(CATEGORIES_DATABASE_ID, {
  id: id(),
  icon: emoji(),
  name: title('Nombre')
});

export const transactionsTable = defineNotionTable(TRANSACTIONS_DATABASE_ID, {
  id: id(),
  amount: number("Valor"),
  date: date("Fecha"),
  type: select("Tipo de Transaccion", ["Gasto", "Ingreso", "Transacción"] as const),
  description: title("Descripción Comercio"),
  account: relation("Cuentas"),
  category: relation("Categorías"),
  month: relation("Mes"),
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