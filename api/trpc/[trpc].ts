import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { inventoryAppRouter } from "../../server/inventory-router";

/**
 * Vercel serverless tRPC handler.
 * Uses lightweight inventory router (mock data) so the hackathon demo
 * works without MySQL/OAuth native deps on serverless.
 * Login/marketing pages remain client-side as before.
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: inventoryAppRouter,
    createContext: async () => ({
      req: req as any,
      res: {} as any,
      user: null,
    }),
  });

export { handler as GET, handler as POST };
