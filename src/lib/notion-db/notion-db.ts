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

  async from<T extends Schema>(
    schema: DatabaseSchema<T>
  ): Promise<Array<InferSchemaType<T> & { id: string }>> {
    const reuls = await this.client.dataSources.query({
      data_source_id: schema.databaseId,
      result_type: "page",
    });
    return reuls.results.map((page) => {
      return this.format(schema.schema, page as PageObjectResponse);
    });
  }

  private format<T extends Schema>(
    schema: T,
    page: PageObjectResponse
  ): InferSchemaType<T> & { id: string } {
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

export function defineSchema<T extends Schema = Schema>(
  databaseId: string,
  schema: T
): DatabaseSchema<T> {
  return { databaseId, schema };
}
