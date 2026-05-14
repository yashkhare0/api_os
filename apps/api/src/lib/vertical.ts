import type { FastifyInstance } from "fastify";
import type { ApiConfig } from "./config";
import type { StateStore } from "./state-store";

export type VerticalContext = {
  config: ApiConfig;
  store: StateStore;
};

export type RegisterVertical = (app: FastifyInstance, context: VerticalContext) => Promise<void>;
