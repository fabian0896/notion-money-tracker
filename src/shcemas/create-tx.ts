import z from "zod";

export const createTxSchema = z.object({
  amount: z.number(),
  description: z.string(),
  category: z.string(),
});