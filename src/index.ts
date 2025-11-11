import { factory } from './lib/factory';
import { notiondb } from './lib/notion-db';
import { accountsTable, categoriesTable, monthsTable, transactionsTable } from './db/schemas';
import { zValidator } from '@hono/zod-validator';
import { createTxSchema } from './shcemas/create-tx';
import { format, formatISO } from 'date-fns';
import { es } from 'date-fns/locale';

const app = factory.createApp();

app.get('/categories', async (c) => {
  const db = notiondb(c);
  const categories = await db.query(categoriesTable);
  const response = categories.map((c) => ({
    ...c,
    full_name: `${c.icon} ${c.name}`,
  }))
  return c.json(response);
});

app.post('/transactions', zValidator('json', createTxSchema), async (c) => {
  const db = notiondb(c);
  const data = c.req.valid('json');

  console.log({ card: data.card });

  const [categories, months, accounts] = await Promise.all([
    db.query(categoriesTable),
    db.query(monthsTable),
    db.query(accountsTable),
  ]);

  const categoryId = categories.find((c) => {
    return c.name.toLocaleLowerCase() === data.category.toLocaleLowerCase();
  })?.id;

  const month = format(new Date(), 'MMMM', { locale: es });
  const monthId = months.find((m) => {
    return m.name.toLocaleLowerCase() === month.toLocaleLowerCase();
  })?.id;

  const accountId = accounts.at(0)?.id;

  const txs = await db.insert(transactionsTable, {
    id: 'ignored',
    type: 'Gasto',
    description: data.description,
    amount: data.amount,
    date: formatISO(new Date(), { format: "basic" }),
    month: monthId,
    category: categoryId,
    account: accountId,
  });
  return c.json(txs);
});

export default app;
