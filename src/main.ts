import fastify from "fastify";
import cors from "@fastify/cors";
import formDataPlugin from "@fastify/formbody";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import supertokens from "supertokens-node";
import { plugin, errorHandler } from "supertokens-node/framework/fastify";

import "./auth/supertokens";
import { router } from "./router";
import { createContext } from "./context";

(async () => {
  try {
    const server = await fastify({
      maxParamLength: 5000,
    });

    await server.register(cors, {
      origin: "http://localhost:5173",
      allowedHeaders: ["Content-Type", ...supertokens.getAllCORSHeaders()],
      credentials: true,
    });

    await server.register(formDataPlugin);
    await server.register(plugin);

    await server.register(fastifyTRPCPlugin, {
      prefix: "/trpc",
      trpcOptions: { router, createContext },
    });

    server.setErrorHandler(errorHandler());

    await server.listen({ port: 3333 });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
