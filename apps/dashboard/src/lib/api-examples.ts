import type { ApiEndpointContract, JsonSchema } from "@dummy-api/contracts";

export type SchemaField = {
  name: string;
  type: string;
  required: boolean;
  enumValues?: Array<string | number | boolean>;
};

export function buildRequestUrl(
  baseUrl: string,
  contract: Pick<ApiEndpointContract, "id" | "path" | "querySchema">
): string {
  return `${baseUrl.replace(/\/+$/, "")}${pathWithExampleParams(contract.path)}${queryExample(contract)}`;
}

export function pathWithExampleParams(path: string): string {
  return path.replace(/:([A-Za-z0-9_]+)/g, (_match, name: string) => String(sampleValue(name, "string")));
}

export function pathParamNames(path: string): string[] {
  return Array.from(path.matchAll(/:([A-Za-z0-9_]+)/g), (match) => match[1]).filter(
    (name): name is string => Boolean(name)
  );
}

export function exampleFromSchema(contract: Pick<ApiEndpointContract, "id" | "bodySchema">): string | undefined {
  if (!contract.bodySchema) {
    return undefined;
  }

  const fields = schemaFields(contract.bodySchema);
  const required = fields.filter((field) => field.required);
  const included = required.length > 0 ? required : fields;
  const body = Object.fromEntries(included.map((field) => [field.name, sampleValue(field.name, field.type, field.enumValues)]));

  return JSON.stringify(body, null, 2);
}

export function sampleCurl(method: string, requestUrl: string, body: string | undefined): string {
  const lines = [`curl --request ${method} '${requestUrl}'`, "  --header 'x-api-key: dak_your_key'"];

  if (body) {
    lines.push("  --header 'content-type: application/json'");
    lines.push(`  --data '${body.replace(/\n/g, "")}'`);
  }

  return lines.join(" \\\n");
}

export function schemaFields(schema: JsonSchema | undefined): SchemaField[] {
  const properties = schema?.properties;
  if (!isRecord(properties)) {
    return [];
  }

  const requiredValue = schema?.required;
  const required = new Set(
    Array.isArray(requiredValue) ? requiredValue.filter((item): item is string => typeof item === "string") : []
  );

  return Object.entries(properties).map(([name, value]) => {
    const enumValues = schemaEnum(value);

    return {
      name,
      type: schemaType(value),
      required: required.has(name),
      ...(enumValues ? { enumValues } : {})
    };
  });
}

function queryExample(contract: Pick<ApiEndpointContract, "id" | "querySchema">): string {
  const fields = schemaFields(contract.querySchema);
  if (fields.length === 0) {
    return "";
  }

  const params = new URLSearchParams();
  for (const field of queryFieldsForContract(contract.id, fields)) {
    params.set(field.name, String(sampleValue(field.name, field.type, field.enumValues)));
  }

  return `?${params.toString()}`;
}

function queryFieldsForContract(contractId: string, fields: SchemaField[]): SchemaField[] {
  const preferredByContract: Record<string, string[]> = {
    "cars.listings.list": ["make", "bodyStyle", "fuelType"],
    "cars.dealers.list": ["state"],
    "ecommerce.products.list": ["category", "q", "limit"],
    "real-estate.properties.list": ["propertyType", "minBedrooms"],
    "stays.listings.list": ["city", "guests"],
    "pokemon.pokemon.list": ["limit"]
  };
  const preferred = preferredByContract[contractId];

  if (!preferred) {
    return fields.slice(0, 2);
  }

  const byName = new Map(fields.map((field) => [field.name, field]));
  return preferred.map((name) => byName.get(name)).filter((field): field is SchemaField => Boolean(field));
}

function sampleValue(name: string, type: string, enumValues?: Array<string | number | boolean>): string | number | boolean {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("bodystyle")) {
    return "suv";
  }

  if (lowerName.includes("fueltype")) {
    return "electric";
  }

  if (lowerName.includes("condition")) {
    return "new";
  }

  if (lowerName.includes("creditrating")) {
    return "excellent";
  }

  if (enumValues && enumValues.length > 0) {
    return enumValues[0] ?? `${name}_demo`;
  }

  if (lowerName === "id" || lowerName.endsWith("id")) {
    return idSample(lowerName);
  }

  if (lowerName === "name") {
    return "bulbasaur";
  }

  if (type === "boolean") {
    return true;
  }

  if (type === "integer" || type === "number") {
    if (lowerName.includes("income")) {
      return 145000;
    }

    if (lowerName.includes("downpayment")) {
      return 12000;
    }

    if (lowerName.includes("term")) {
      return 60;
    }

    if (lowerName.includes("price") || lowerName.includes("rate")) {
      return 250;
    }

    if (lowerName.includes("quantity") || lowerName.includes("guest") || lowerName.includes("limit")) {
      return 2;
    }

    return 1;
  }

  if (lowerName.includes("date")) {
    return lowerName.includes("end") ? "2026-06-15T10:00:00.000Z" : "2026-06-12T10:00:00.000Z";
  }

  if (lowerName.includes("email")) {
    return "buyer@example.test";
  }

  if (lowerName.includes("postal")) {
    return "98101";
  }

  if (lowerName.includes("category")) {
    return "electronics";
  }

  if (lowerName === "q") {
    return "wireless";
  }

  if (lowerName.includes("state")) {
    return "WA";
  }

  if (lowerName.includes("city")) {
    return "Seattle";
  }

  if (lowerName.includes("make")) {
    return "Electra";
  }

  if (lowerName.includes("applicant") || lowerName.includes("guest") || lowerName.includes("customer")) {
    return "Demo User";
  }

  return `${name}_demo`;
}

function idSample(lowerName: string): string {
  if (lowerName.includes("listing")) {
    return "car_electra_suv_01";
  }

  if (lowerName.includes("product")) {
    return "prod_noise_canceling_earbuds_01";
  }

  if (lowerName.includes("property")) {
    return "property_austin_bungalow_01";
  }

  if (lowerName.includes("cart")) {
    return "cart_demo";
  }

  if (lowerName.includes("order")) {
    return "order_demo";
  }

  if (lowerName.includes("checkout")) {
    return "checkout_demo";
  }

  return `${lowerName}_demo`;
}

function schemaType(value: unknown): string {
  if (!isRecord(value)) {
    return "unknown";
  }

  return typeof value.type === "string" ? value.type : "unknown";
}

function schemaEnum(value: unknown): Array<string | number | boolean> | undefined {
  if (!isRecord(value) || !Array.isArray(value.enum)) {
    return undefined;
  }

  const values = value.enum.filter(
    (item): item is string | number | boolean =>
      typeof item === "string" || typeof item === "number" || typeof item === "boolean"
  );

  return values.length > 0 ? values : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
