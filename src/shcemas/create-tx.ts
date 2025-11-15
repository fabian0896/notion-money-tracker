import z from "zod";
import { removeEmojis } from "../utils/remove-emoji";

export const CreateTxSchema = z.object({
  amount: z.number(),
  description: z.string(),
  category: z.string().transform(removeEmojis).optional(),
  card: z.string().optional(),
  tx: z.any().optional(),
});