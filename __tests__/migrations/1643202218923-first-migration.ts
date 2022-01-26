import { readFile, writeFile } from "fs/promises";
import { Migration } from "../../src/types";

const filename = "__tests__/data.json";

class FirstMigration implements Migration {
  public async up() {
    const data = JSON.parse(await readFile(filename, "utf-8"));
    const newData = { ...data, foo: ["foo1", "foo2"] };
    await writeFile("__tests__/data.json", JSON.stringify(newData));
  }
  public async down() {
    const data = JSON.parse(await readFile(filename, "utf-8"));
    const oldData = { ...data, foo: "foo" };
    await writeFile("__tests__/data.json", JSON.stringify(oldData));
  }
}

export default FirstMigration;
