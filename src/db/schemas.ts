import { CATEGORIES_DATABASE_ID } from "../constants/databases";
import { id, title } from "../lib/notion-db";
import { defineSchema } from "../lib/notion-db/notion-db";

export const categoriesTable = defineSchema(CATEGORIES_DATABASE_ID, {
  id: id(),
  name: title('Nombre'),
});