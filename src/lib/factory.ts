import { createFactory } from "hono/factory";
import { HonoEnv } from "../models/env";

export const factory = createFactory<HonoEnv>();