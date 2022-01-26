import { readFile, writeFile } from "fs/promises";
import { Migration } from "../../src/types";

const filename = "__tests__/data.json";

class SecondMigration implements Migration {
  public async up() {
    const data = JSON.parse(await readFile(filename, "utf-8"));
    const newData = { ...data, bar: ["bar1", "bar2"] };
    await writeFile("__tests__/data.json", JSON.stringify(newData));
  }
  public async down() {
    const data = JSON.parse(await readFile(filename, "utf-8"));
    const oldData = { ...data, bar: "bar" };
    await writeFile("__tests__/data.json", JSON.stringify(oldData));
  }
}

export default SecondMigration;
