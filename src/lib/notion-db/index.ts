import { Context } from "hono";
import { HonoEnv } from '../../models/env';
import { NotionDBClient } from "./notion-db";

export { defineSchema } from './notion-db';
export * from './colums';

export function notiondb(c: Context<HonoEnv>) {
  return new NotionDBClient(c.env.NOTION_API_KEY);
}