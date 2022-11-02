import { createContext } from "./trpc/context";
import { appRouter } from "./trpc/router/_app";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import fetch from "node-fetch";
import ws from "ws";

if (!global.fetch) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).fetch = fetch;
}
const wss = new ws.Server({
  port: 3001,
});
const handler = applyWSSHandler({ wss, router: appRouter, createContext });

wss.on("connection", (ws) => {
  console.log(`Opened connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`Closed connection (${wss.clients.size})`);
  });

  ws.on("message", (data) => {
    console.log("message", data.toString());
    ws.send(data.toString() + " sent back");
  });
});

console.log("✅ WebSocket Server listening on ws://localhost:3001");

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});