import { factory } from "./lib/factory";
import { notiondb, notiondbClaro } from "./lib/notion-db";
import {
  accountsTable,
  categoriesTable,
  clientsTable,
  contactsTable,
  monthsTable,
  transactionsTable,
} from "./db/schemas";
import { zValidator } from "@hono/zod-validator";
import { CreateContactSchema, CreateTxSchema, GetCategoriesOptions } from "./shcemas/create-tx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { parseToNumber } from "./lib/parse-to-number";
import { formatInTimeZone } from "date-fns-tz";

const app = factory.createApp();

app.get("/categories", async (c) => {
  const db = notiondb(c);
  const categories = await db.query(categoriesTable);
  const response = categories.map((c) => ({
    ...c,
    full_name: `${c.icon} ${c.name}`,
  }));
  return c.json(response);
});

app.post("/categories-v2", zValidator('json', GetCategoriesOptions), async (c) => {
  const { type } = c.req.valid('json');
  const db = notiondb(c);
  const categories = await db.query(categoriesTable);
  const response = categories
    .filter((c) => c.type === type)
    .map((c) => `${c.icon} ${c.name}`);
  return c.json(response);
});

app.get("/accounts", async (c) => {
  const db = notiondb(c);
  const categories = await db.query(accountsTable);
  const response = categories.map((c) => c.name);
  return c.json(response);
});

app.post("/transactions", zValidator("json", CreateTxSchema), async (c) => {
  const db = notiondb(c);
  const data = c.req.valid("json");

  console.log({ data });

  const [categories, months, accounts] = await Promise.all([
    db.query(categoriesTable),
    db.query(monthsTable),
    db.query(accountsTable),
  ]);

  const month = format(new Date(), "MMMM", { locale: es });
  const monthId = months.find((m) => {
    return m.name.toLocaleLowerCase() === month.toLocaleLowerCase();
  })?.id;

  const defaultAccountId = accounts.at(0)?.id;
  const accountId = accounts.find((a) => {
    const cardName = data.card?.toLocaleLowerCase();
    return (
      a.wallet?.toLocaleLowerCase() === cardName ||
      a.name.toLocaleLowerCase() === cardName
    );
  })?.id || defaultAccountId;

  let destinationId = undefined;
  if (data.type === 'Transferencia') {
    destinationId = accounts.find((a) => {
      const cardName = data.destination?.toLocaleLowerCase();
      return (
        a.wallet?.toLocaleLowerCase() === cardName ||
        a.name.toLocaleLowerCase() === cardName
      );
    })?.id;
  }

  const amount = parseToNumber(data.amount || data.tx || 0);

  let category = categories.find((c) => {
    return c.name.toLocaleLowerCase() === data.category?.toLocaleLowerCase();
  })?.id;
  if (data.type === 'Transferencia') {
    category = categories.find((c) => {
      return c.name.toLocaleLowerCase() === 'transferencia';
    })?.id;
  }

  const description = data.type === 'Transferencia'? 'Transferencia' : data.description;

  const isoDate = formatInTimeZone(new Date(), "America/Bogota", "yyyy-MM-dd");
  const txs = await db.insert(transactionsTable, {
    id: "ignored",
    type: data.type,
    description: description,
    amount: amount,
    date: isoDate,
    month: monthId,
    category: category,
    account: accountId,
    destination: destinationId,
  });

  console.log({ txs });
  return c.json(txs);
});


app.get('/clients', async (c) => {
  const db = notiondbClaro(c);
  const clients = await db.query(clientsTable);
  const list = clients.map((c) => c.name);
  return c.json(list);
});

app.post('/contact', zValidator('json', CreateContactSchema), async (c) => {
  const db = notiondbClaro(c);
  const data = c.req.valid('json');
  const clients = await db.query(clientsTable);

  const companyName = data.company.toLocaleLowerCase();
  const companyId = clients.find((c) => {
    return c.name.toLocaleLowerCase() === companyName;
  })?.id;

  await db.insert(contactsTable, {
    id: 'ignore',
    name: data.name,
    phone_number: data.phone_number,
    email: data.email || null,
    company: companyId,
  });
})

app.onError((err, c) => {
  console.error("Error occurred:", err);
  return c.json(
    {
      message: "Internal Server Error",
      details: err.message,
    },
    500
  );
});

export default app;
