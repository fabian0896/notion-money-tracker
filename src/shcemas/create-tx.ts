import z from "zod";
import { removeEmojis } from "../utils/remove-emoji";

export const createTxSchema = z.object({
  amount: z.number(),
  description: z.string(),
  category: z.string().transform(removeEmojis),
  card: z.string().optional(),
  tx: z.any().optional(),
});