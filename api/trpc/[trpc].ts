import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/routers";
import { sdk } from "../../server/_core/sdk";
import * as db from "../../server/db";
import { COOKIE_NAME } from "../../shared/const";
import type { TrpcContext } from "../../server/_core/context";

const handler = (req: Request) => {
  const getUser = async () => {
    try {
      const cookieHeader = req.headers.get("cookie") || "";
      const cookies = new Map<string, string>();
      cookieHeader.split(";").forEach((cookie) => {
        const [key, ...rest] = cookie.trim().split("=");
        cookies.set(key, rest.join("="));
      });
      const sessionToken = cookies.get(COOKIE_NAME);
      if (sessionToken) {
        const session = await sdk.verifySession(sessionToken);
        if (session) {
          const user = await db.getUserByOpenId(session.openId);
          return user || null;
        }
      }
    } catch {
      // Auth is optional for public procedures
    }
    return null;
  };

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async (): Promise<TrpcContext> => {
      const user = await getUser();
      return {
        req: req as any,
        res: {} as any,
        user,
      };
    },
  });
};

export { handler as GET, handler as POST };
