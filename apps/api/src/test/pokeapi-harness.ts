import { createServer, type Server, type ServerResponse } from "node:http";

export type PokeApiHarness = {
  url: string;
  close(): Promise<void>;
};

export async function startPokeApiHarness(): Promise<PokeApiHarness> {
  const server = createServer((request, response) => {
    const path = request.url?.split("?")[0] ?? "/";

    if (path === "/pokemon") {
      sendJson(response, 200, {
        count: 1,
        results: [{ name: "bulbasaur", url: "/pokemon/bulbasaur" }]
      });
      return;
    }

    if (path === "/pokemon/bulbasaur") {
      sendJson(response, 200, {
        id: 1,
        name: "bulbasaur",
        sprites: {
          front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
        }
      });
      return;
    }

    sendJson(response, 404, { detail: "Not found." });
  });

  await listen(server);
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("PokeAPI harness server did not bind to a TCP port.");
  }

  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () => close(server)
  };
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

async function listen(server: Server): Promise<void> {
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
}

async function close(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
