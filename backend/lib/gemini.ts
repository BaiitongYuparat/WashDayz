import * as fs from "fs";
import * as path from "path";

interface ModelInfo {
  name: string;
  fields: string[];
}

function readPrismaSchema(): ModelInfo[] {
  const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
  const content = fs.readFileSync(schemaPath, "utf-8"); //อ่านไฟล์ schema เป็น text
  const models: ModelInfo[] = []; //เก็บข้อมูล model ที่อ่านได้

  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g; //
  let match;

  while ((match = modelRegex.exec(content)) !== null) {
    const modelName = match[1];
    const body = match[2];

    const fields = body
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          line &&
          !line.startsWith("//") &&
          !line.startsWith("@") &&
          !line.startsWith("@@")
      )
      .map((line) => line.split(/\s+/)[0])
      .filter(Boolean);

    models.push({ name: modelName, fields });
  }

  return models;
}

export function getSchemaAsText(): string {
  const models = readPrismaSchema();
  return models
    .map((m) => `Model: ${m.name}\nFields: ${m.fields.join(", ")}`)
    .join("\n\n");
}