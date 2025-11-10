import { PageObjectResponse } from "@notionhq/client";

export type PropertyType =
  | "title"
  | "rich_text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "checkbox"
  | "url"
  | "email"
  | "phone_number"
  | "relation"
  | "people"
  | "files"
  | "status"
  | "id";

export interface Column<T = any> {
  type: PropertyType;
  notionName: string;
  options?: readonly string[]; // Para select/multi_select
  serialize: (value: T) => any; // Tu valor → Notion API
  deserialize: (notionValue: any, page: PageObjectResponse) => T; // Notion API → Tu valor
}

export type Schema = Record<string, Column>;

export type InferSchemaType<T extends Schema> = {
  [K in keyof T]: T[K] extends Column<infer U> ? U : never;
};

export interface DatabaseSchema<T extends Schema = Schema> {
  databaseId: string;
  schema: T;
}