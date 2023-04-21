import "../styles/globals.css";

import { useEffect, useState } from "react";

import { withTRPC } from "@trpc/next";
import Lottie from "lottie-react";
import { getSession, SessionProvider, signOut } from "next-auth/react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

import FoodLoading from "@musicprod/assets/animations/food-loading.json";
import type { AppRouter } from "@musicprod/backend/router";
import { UserSession } from "@musicprod/types/authTypes";
import { isProtectedRoute } from "@musicprod/utils";

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const [session, setSession] = useState(pageProps.session as UserSession);
  const [isLoading, setIsLoading] = useState(isProtectedRoute(router.pathname));

  const fetchSession = async () => {
    const session = (await getSession()) as UserSession;

    if (!session) {
      signOut();
      return;
    }

    setSession(session);
    setTimeout(() => {
      setIsLoading(false);
    }, 250);
  };

  useEffect(() => {
    if (isProtectedRoute(router.pathname) && !session) {
      setIsLoading(true);
      fetchSession();
    }
    // eslint-disable-next-line
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Lottie animationData={FoodLoading} />
      </div>
    );
  }

  return (
    <SessionProvider session={session}>
      <div className="max-w-screen-xxl m-auto overflow-x-hidden">
        <Component {...pageProps} syncSession={fetchSession} />
      </div>
    </SessionProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }
  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // reference for render.com
  if (process.env.RENDER_INTERNAL_HOSTNAME) {
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  }

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3200}`;
}

export default withTRPC<AppRouter>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */

    return {
      url: `${getBaseUrl()}/api/trpc`,
      headers: () => {
        if (ctx?.req) {
          // on ssr, forward client's headers to the server
          return {
            ...ctx.req.headers,
            "x-ssr": "1",
          };
        }
        return {};
      },
      /**
       * @link https://react-query-v3.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(App);
