import { factory } from './lib/factory';
import { notiondb } from './lib/notion-db';
import { accountsTable, categoriesTable, monthsTable, transactionsTable } from './db/schemas';
import { zValidator } from '@hono/zod-validator';
import { CreateTxSchema } from './shcemas/create-tx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseToNumber } from './lib/parse-to-number';

const app = factory.createApp();

app.get('/categories', async (c) => {
  const db = notiondb(c);
  const categories = await db.query(categoriesTable);
  const response = categories.map((c) => ({
    ...c,
    full_name: `${c.icon} ${c.name}`,
  }));
  return c.json(response);
});

app.post('/transactions', zValidator('json', CreateTxSchema), async (c) => {
  const db = notiondb(c);
  const data = c.req.valid('json');

  console.log({ data });

  const [categories, months, accounts] = await Promise.all([
    db.query(categoriesTable),
    db.query(monthsTable),
    db.query(accountsTable),
  ]);

  const categoryId = categories.find((c) => {
    return c.name.toLocaleLowerCase() === data.category?.toLocaleLowerCase();
  })?.id;

  const month = format(new Date(), 'MMMM', { locale: es });
  const monthId = months.find((m) => {
    return m.name.toLocaleLowerCase() === month.toLocaleLowerCase();
  })?.id;

  const defaultAccountId = accounts.at(0)?.id;
  const accountId = accounts.find((a) => {
    return a.wallet?.toLocaleLowerCase() === data.card?.toLocaleLowerCase();
  })?.id || defaultAccountId;

  const amount = parseToNumber(data.amount || data.tx || 0);

  const isoDate = format(new Date(), 'yyyy-MM-dd');
  const txs = await db.insert(transactionsTable, {
    id: 'ignored',
    type: 'Gasto',
    description: data.description,
    amount: amount,
    date: isoDate,
    month: monthId,
    category: categoryId,
    account: accountId,
  });

  console.log({ txs });
  return c.json(txs);
});

app.post('/test', zValidator('json', CreateTxSchema), async (c) => {
  const data = c.req.valid('json');
  return c.json(data);
});

app.use('*', async (c, next) => {
  if (c.req.method === 'POST' || c.req.method === 'PUT'){
    console.log('Body:', await c.req.json());
  }
  await next();
});

app.onError((err, c) => {
  console.error('Error occurred:', err);
  return c.json({
    message: 'Internal Server Error',
    details: err.message,
  }, 500);
});

export default app;
