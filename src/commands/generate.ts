import { exec } from "child_process";
import { join } from "path";
import { writeFile, mkdir } from "fs/promises";

const DIR_NAME = "migrations";

export const generateMigration = async (name?: string): Promise<string> => {
  if (!name) throw new Error("Name not provided!");
  const filePath = join(process.cwd(), DIR_NAME, generateFilename(name));
  await mkdir(DIR_NAME);
  await writeFile(filePath, getMigrationFileContent(name));
  console.log(`Generated ${filePath}`);
  return filePath;
};

export const generateFilename = (name: string): string => {
  const epoch = new Date().getTime();
  return `${epoch}-${name}.ts`;
};

export const generateClassName = (name: string): string => {
  const pascalCased = name.replace(/(\w)(\w*)/g, (_, g1, g2) => {
    return g1.toUpperCase() + g2.toLowerCase();
  });
  return pascalCased.replace(/-/g, "");
};

const getMigrationFileContent = (name: string): string => {
  const className = generateClassName(name);
  return `import { Migration } from "lyfter";

class ${className} implements Migration {
  public static async up() {}
  public static async down() {}
};

export default ${className};`;
};
