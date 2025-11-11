import { DatabaseSchema, InferSchemaType, Schema } from "./db-types";
import { Client, PageObjectResponse } from "@notionhq/client";

export class NotionDBClient {
  private client: Client;

  constructor(token: string) {
    this.client = new Client({
      auth: token,
      fetch: (url, init) => fetch(url, init),
    });
  }

  async query<T extends Schema>(
    schema: DatabaseSchema<T>
  ): Promise<InferSchemaType<T>[]> {
    const reuls = await this.client.dataSources.query({
      data_source_id: schema.databaseId,
      result_type: "page",
    });
    return reuls.results.map((page) => {
      return this.format(schema.schema, page as PageObjectResponse);
    });
  }

  async insert<T extends Schema>(
    schema: DatabaseSchema<T>,
    data: InferSchemaType<T>,
  ): Promise<InferSchemaType<T>> {
    const result = await this.client.dataSources.create({
      parent: {
        database_id: schema.databaseId,
        type: 'database_id',
      },
      properties: this.getPropertyObject(schema.schema, data),
    });
    return result as InferSchemaType<T>;
  }

  private getPropertyObject<T extends Schema>(schema: T, data: InferSchemaType<T>) {
    const select = Object.entries(schema);
    return select.reduce(
      (acc, [key, col]) => {
        const value = data[key];
        if (!col.notionName) return acc;
        acc[col.notionName] = col.serialize(value);
        return acc;
      },
      {} as any
    );
  }

  private format<T extends Schema>(
    schema: T,
    page: PageObjectResponse
  ): InferSchemaType<T> {
    const properties = page.properties;
    const select = Object.entries(schema);
    return select.reduce(
      (acc, [key, col]) => {
        const notionValue = properties[col.notionName];
        acc[key] = col.deserialize(notionValue, page);
        return acc;
      },
      {} as any
    );
  }
}

export function defineNotionTable<T extends Schema = Schema>(
  databaseId: string,
  schema: T
): DatabaseSchema<T> {
  return { databaseId, schema };
}
