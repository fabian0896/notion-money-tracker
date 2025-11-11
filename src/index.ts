import { factory } from './lib/factory';
import { notiondb } from './lib/notion-db';
import { categoriesTable, transactionsTable } from './db/schemas';
import { zValidator } from '@hono/zod-validator';
import { createTxSchema } from './shcemas/create-tx';

const app = factory.createApp();

app.get('/categories', async (c) => {
  const db = notiondb(c);
  const categories = await db.from(categoriesTable);
  const response = categories.map((c) => ({
    ...c,
    full_name: `${c.icon} ${c.name}`,
  }))
  return c.json(response);
});

app.post('/transaction', zValidator('json', createTxSchema), async (c) => {
  const db = notiondb(c);
  const data = c.req.valid('json');

  const txs = await db.insert(transactionsTable, {
    id: 'ignored',
    type: 'Gasto',
    description: data.description,
    amount: data.amount,
    date: new Date().toISOString(),
    category: data.category,
    account: 'some-account-id',
    month: 'some-month-id',
  });
  return c.json(txs);
});

export default app;
