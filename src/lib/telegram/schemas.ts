import { z } from "zod"

export const TelegramUpdate = z.object({
  update_id: z.number().optional()
})

export type TelegramUpdate = z.infer<typeof TelegramUpdate>
