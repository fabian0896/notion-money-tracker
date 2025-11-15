import z from "zod";
import { removeEmojis } from "../utils/remove-emoji";

export const CreateTxSchema = z.object({
  amount: z.string().transform((val) => {
    const cleaned = val.replace(/[$,\s.]/g, '');;
    return parseInt(cleaned, 10);
  }),
  description: z.string(),
  category: z.string().transform(removeEmojis).optional(),
  card: z.string().optional(),
  tx: z.any().optional(),
});