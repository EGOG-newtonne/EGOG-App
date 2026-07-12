import { z } from "zod";

type EnvironmentInput = Readonly<Record<string, string | undefined>>;

export function parseEnvironment<Schema extends z.ZodType>(
  schema: Schema,
  input: EnvironmentInput,
  scope: "client" | "server",
): z.output<Schema> {
  const result = schema.safeParse(input);

  if (!result.success) {
    const variableNames = [
      ...new Set(
        result.error.issues.map((issue) => issue.path.join(".") || "environment"),
      ),
    ].sort();

    throw new Error(
      `Invalid ${scope} environment variables: ${variableNames.join(", ")}`,
    );
  }

  return result.data;
}
