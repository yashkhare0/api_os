import { endpointContracts, type ApiEndpointContract, type JsonSchema } from "@dummy-api/contracts";
import { getVertical } from "@dummy-api/catalog";
import type { VerticalMetadata } from "@dummy-api/core";

type OpenApiMethod = "get" | "post";

type OpenApiParameter = {
  name: string;
  in: "path" | "query";
  required: boolean;
  schema: Record<string, unknown>;
};

export function buildAppOpenApiDocument(appSlug: string, baseUrl: string): Record<string, unknown> | undefined {
  const vertical = getVertical(appSlug);

  if (!vertical) {
    return undefined;
  }

  const contracts = endpointContracts.filter((contract) => contract.verticalSlug === vertical.slug);
  const document = baseDocument(vertical, baseUrl);
  const paths = document.paths as Record<string, Partial<Record<OpenApiMethod, Record<string, unknown>>>>;

  for (const contract of contracts) {
    const path = toOpenApiPath(contract.path);
    const pathItem = paths[path] ?? {};
    pathItem[methodKey(contract.method)] = operationForContract(contract, vertical);
    paths[path] = pathItem;
  }

  return document;
}

function baseDocument(vertical: VerticalMetadata, baseUrl: string): Record<string, unknown> {
  return {
    openapi: "3.1.0",
    info: {
      title: `${vertical.name} API`,
      version: "1.0.0",
      description: vertical.description
    },
    servers: [{ url: baseUrl.replace(/\/+$/, "") }],
    security: [{ ApiKeyAuth: [] }],
    tags: [{ name: vertical.name, description: vertical.description }],
    paths: {},
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key"
        }
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          required: ["data"],
          properties: {
            data: { description: "Endpoint response payload." },
            meta: {
              type: "object",
              additionalProperties: true
            }
          },
          additionalProperties: false
        },
        ErrorResponse: {
          type: "object",
          required: ["error"],
          properties: {
            error: {
              type: "object",
              required: ["code", "message"],
              properties: {
                code: { type: "string" },
                message: { type: "string" }
              },
              additionalProperties: true
            }
          },
          additionalProperties: false
        }
      }
    },
    ...(vertical.upstream
      ? {
          externalDocs: {
            description: `${vertical.upstream.name} upstream documentation`,
            url: vertical.upstream.documentationUrl ?? vertical.upstream.baseUrl
          },
          "x-dummy-api-upstream": {
            name: vertical.upstream.name,
            baseUrl: vertical.upstream.baseUrl,
            ...(vertical.upstream.sourceUrl ? { sourceUrl: vertical.upstream.sourceUrl } : {}),
            ...(vertical.upstream.allowedRoutes ? { allowedRoutes: vertical.upstream.allowedRoutes } : {})
          }
        }
      : {})
  };
}

function operationForContract(contract: ApiEndpointContract, vertical: VerticalMetadata): Record<string, unknown> {
  const parameters = [...pathParameters(contract.path, contract.paramsSchema), ...queryParameters(contract.querySchema)];

  return {
    operationId: operationId(contract.id),
    tags: [vertical.name],
    summary: summaryFromContract(contract.id),
    description: `${contract.method} ${contract.path}`,
    security: [{ ApiKeyAuth: [] }],
    ...(parameters.length > 0 ? { parameters } : {}),
    ...(contract.bodySchema
      ? {
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: contract.bodySchema
              }
            }
          }
        }
      : {}),
    responses: {
      "200": {
        description: "Successful response.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/SuccessResponse" }
          }
        }
      },
      "400": errorResponse("Invalid request."),
      "401": errorResponse("Missing or invalid API key."),
      "404": errorResponse("Resource not found."),
      ...(vertical.upstream ? { "502": errorResponse("Upstream API failed or timed out.") } : {})
    },
    "x-dummy-api-contract-id": contract.id,
    "x-dummy-api-auth-required": contract.authRequired,
    ...(vertical.upstream
      ? {
          "x-dummy-api-upstream-name": vertical.upstream.name
        }
      : {})
  };
}

function pathParameters(path: string, schema: JsonSchema | undefined): OpenApiParameter[] {
  const properties = schemaProperties(schema);

  return pathParamNames(path).map((name) => {
    const parameterSchema = schemaObject(properties[name]);

    return {
      name,
      in: "path",
      required: true,
      schema: Object.keys(parameterSchema).length > 0 ? parameterSchema : { type: "string" }
    };
  });
}

function queryParameters(schema: JsonSchema | undefined): OpenApiParameter[] {
  const properties = schemaProperties(schema);
  const required = requiredFields(schema);

  return Object.entries(properties).map(([name, propertySchema]) => ({
    name,
    in: "query",
    required: required.has(name),
    schema: schemaObject(propertySchema)
  }));
}

function errorResponse(description: string): Record<string, unknown> {
  return {
    description,
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" }
      }
    }
  };
}

function schemaProperties(schema: JsonSchema | undefined): Record<string, unknown> {
  return isRecord(schema?.properties) ? schema.properties : {};
}

function requiredFields(schema: JsonSchema | undefined): Set<string> {
  const required = schema?.required;
  return new Set(Array.isArray(required) ? required.filter((item): item is string => typeof item === "string") : []);
}

function schemaObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function pathParamNames(path: string): string[] {
  return Array.from(path.matchAll(/:([A-Za-z0-9_]+)/g), (match) => match[1]).filter(
    (name): name is string => Boolean(name)
  );
}

function toOpenApiPath(path: string): string {
  return path.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
}

function methodKey(method: ApiEndpointContract["method"]): OpenApiMethod {
  return method.toLowerCase() as OpenApiMethod;
}

function operationId(contractId: string): string {
  return contractId.replace(/[^A-Za-z0-9_]+/g, "_");
}

function summaryFromContract(contractId: string): string {
  return contractId
    .split(".")
    .slice(1)
    .map((part) => part.replace(/[-_]+/g, " "))
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
