import { factory } from './lib/factory';
import { notiondb } from './lib/notion-db';
import { categoriesTable } from './db/schemas';

const app = factory.createApp();

app.get('/categories', async (c) => {
  const db = notiondb(c);
  const result = await db.from(categoriesTable);
  return c.json(result);
});

export default app;
