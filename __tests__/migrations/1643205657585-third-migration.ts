import { readFile, writeFile } from "fs/promises";
import { Migration } from "../../src/types";

const filename = "__tests__/data.json";

class ThirdMigration implements Migration {
  public async up() {
    const data = JSON.parse(await readFile(filename, "utf-8"));
    const newData = { ...data, baz: ["baz1", "baz2"] };
    await writeFile("__tests__/data.json", JSON.stringify(newData));
  }
  public async down() {
    const data = JSON.parse(await readFile(filename, "utf-8"));
    const oldData = { ...data, baz: "baz" };
    await writeFile("__tests__/data.json", JSON.stringify(oldData));
  }
}

export default ThirdMigration;
