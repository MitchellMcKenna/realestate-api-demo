import { z, object, string, number } from 'zod';

export const HouseSchema = object({
  id: number(),
  address: string(),
  homeowner: string(),
  price: number(),
  photoURL: string(),
});

export type House = z.infer<typeof HouseSchema>;
