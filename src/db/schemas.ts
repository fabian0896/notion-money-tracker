import { CATEGORIES_DATABASE_ID } from "../constants/databases";
import { emoji, id, title } from "../lib/notion-db";
import { defineNotionTable } from "../lib/notion-db/notion-db";

export const categoriesTable = defineNotionTable(CATEGORIES_DATABASE_ID, {
  id: id(),
  icon: emoji(),
  name: title('Nombre')
});