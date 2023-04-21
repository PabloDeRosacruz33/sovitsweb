import { createReactQueryHooks } from "@trpc/react";
import type { inferProcedureOutput } from "@trpc/server";

import type { AppRouter } from "@musicprod/backend/router";
export const trpc = createReactQueryHooks<AppRouter>();

export type InferQueryResponse<
  TRouteKey extends keyof AppRouter["_def"]["queries"]
> = inferProcedureOutput<AppRouter["_def"]["queries"][TRouteKey]>;
