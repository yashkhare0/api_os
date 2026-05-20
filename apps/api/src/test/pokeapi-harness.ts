import { createServer, type Server, type ServerResponse } from "node:http";

export type PokeApiHarness = {
  url: string;
  close(): Promise<void>;
};

export async function startPokeApiHarness(): Promise<PokeApiHarness> {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const path = url.pathname;

    if (path === "/pokemon") {
      const limit = Number(url.searchParams.get("limit") ?? 20);
      const offset = Number(url.searchParams.get("offset") ?? 0);
      sendJson(response, 200, {
        count: 2,
        next: offset + limit < 2 ? `/pokemon?offset=${offset + limit}&limit=${limit}` : null,
        previous: offset > 0 ? `/pokemon?offset=${Math.max(0, offset - limit)}&limit=${limit}` : null,
        results: [
          { name: "bulbasaur", url: "/pokemon/bulbasaur" },
          { name: "ivysaur", url: "/pokemon/ivysaur" }
        ].slice(offset, offset + limit)
      });
      return;
    }

    if (path === "/ability") {
      sendJson(response, 200, {
        count: 1,
        next: null,
        previous: null,
        results: [{ name: "stench", url: "/ability/stench" }]
      });
      return;
    }

    if (path === "/ability/stench") {
      sendJson(response, 200, {
        id: 1,
        name: "stench",
        effect_entries: [{ language: { name: "en" }, short_effect: "May cause flinching." }]
      });
      return;
    }

    if (path === "/meta") {
      sendJson(response, 200, {
        deploy_date: "1778644762",
        hash: "test-pokeapi-harness",
        tag: null
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

    if (path === "/pokemon/bulbasaur/encounters") {
      sendJson(response, 200, [
        {
          location_area: { name: "cerulean-city-area", url: "/location-area/281" },
          version_details: []
        }
      ]);
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
