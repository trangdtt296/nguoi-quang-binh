import { Router } from "express";
import { destinationsRouter } from "./destinations";
import { articlesRouter } from "./articles";
import { coursesRouter } from "./courses";
import { miscRouter } from "./misc";

export const publicRouter = Router();

publicRouter.use("/destinations", destinationsRouter);
publicRouter.use("/articles", articlesRouter);
publicRouter.use("/courses", coursesRouter);
publicRouter.use(miscRouter);
