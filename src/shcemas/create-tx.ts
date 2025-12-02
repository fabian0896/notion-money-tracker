import z from "zod";
import { removeEmojis } from "../utils/remove-emoji";

export const CreateTxSchema = z.object({
  amount: z.any().optional(),
  description: z.string().default('Sin description'),
  category: z.string().transform(removeEmojis).optional(),
  card: z.string().optional(),
  tx: z.any().optional(),
  type: z.enum(['Gasto', 'Ingreso', 'Transferencia']).default('Gasto'),
  destination: z.string().optional(),
});