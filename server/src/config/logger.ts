import pino from "pino";
import { env } from "./env";

export const logger = pino({
  level: env.isProduction ? "info" : "debug",
  // Ở production ghi JSON một dòng cho dễ gom log; ở dev không cần.
  transport: env.isProduction
    ? undefined
    : { target: "pino/file", options: { destination: 1 } },
});
