import { DatabaseSchema, InferSchemaType, Schema } from "./db-types";
import { Client, NotionClientError, PageObjectResponse } from "@notionhq/client";

export class NotionDBClient {
  private client: Client;
  private token: string;

  constructor(token: string) {
    this.client = new Client({
      auth: token,
      fetch: (url, init) => fetch(url, init),
    });
    this.token = token;
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
    const properties = this.getPropertyObject(schema.schema, data);
    const result = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Notion-Version': '2025-09-03',
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: {
          data_source_id: schema.databaseId,
          type: "data_source_id",
        },
        properties,
      })
    });
    if (!result.ok) {
      const error = await result.json<NotionClientError>();
      console.error('Notion API error:', error);
      throw new Error(error.message);
    }
    return result.json<InferSchemaType<T>>();
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
