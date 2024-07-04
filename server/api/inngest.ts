import { serve } from "inngest/nuxt";
import eventHandlers from "../inngest/eventHandlers";
import cronHandlers from "../inngest/crons";
import { inngest } from "~/server/inngest/client";

export default defineEventHandler(
  serve({ client: inngest, functions: [...eventHandlers, ...cronHandlers] }),
);
