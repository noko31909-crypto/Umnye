import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { inventoryAppRouter } from "../../server/inventory-router";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: inventoryAppRouter,
    createContext: async () => ({}),
  });

export default handler;
export { handler as GET, handler as POST };
