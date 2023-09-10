import { EventSchemas, Inngest } from "inngest";
import type { Events } from "./eventHandlers";

const runtimeConfig = useRuntimeConfig();

// @ts-expect-error
const HemocioneEventSchemas = new EventSchemas().fromRecord<Events>();

export const inngest = new Inngest({
  name: "Hemocione - Eventos Digitais",
  schemas: HemocioneEventSchemas,
  eventKey: runtimeConfig.inngestKey,
});
