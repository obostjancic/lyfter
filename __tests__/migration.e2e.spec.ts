import { MigrationService } from "../src/services/migration.service";
import { MigrationRecord, MigrationRepository } from "../src/types";
import { join } from "path";
import { readFile, unlink, writeFile } from "fs/promises";

class MockRepository implements MigrationRepository {
  private migrations: MigrationRecord[] = [];

  findAll(): Promise<MigrationRecord[]> {
    return Promise.resolve(this.migrations);
  }
  create(migration: MigrationRecord): Promise<void> {
    this.migrations.push(migration);
    return Promise.resolve();
  }
  delete(migration: MigrationRecord): Promise<void> {
    const index = this.migrations.findIndex(item => item.name === migration.name);
    this.migrations.splice(index, 1);
    return Promise.resolve();
  }
}

describe("Lyfter E2E test", () => {
  beforeEach(() => {
    writeFile(
      "__tests__/data.json",
      JSON.stringify({
        foo: "foo",
        bar: "bar",
        baz: "baz",
      })
    );
  });

  afterAll(async () => {
    await unlink("__tests__/data.json");
  });

  const data = async () => JSON.parse(await readFile("__tests__/data.json", "utf-8"));

  it("should read and apply all of the migrations", async () => {
    const repo = new MockRepository();
    const service = new MigrationService({
      migrationRepository: repo,
      migrations: join(process.cwd(), "__tests__", "migrations"),
    });

    expect(await repo.findAll()).toHaveLength(0);
    expect((await data()).bar).toStrictEqual("bar");

    await service.apply();

    expect(await repo.findAll()).toHaveLength(3);
    expect((await data()).baz).toStrictEqual(["baz1", "baz2"]);
  });

  it("should read and apply all of the migrations, roll back one of them, then apply them again", async () => {
    const repo = new MockRepository();
    const service = new MigrationService({
      migrationRepository: repo,
      migrations: join(process.cwd(), "__tests__", "migrations"),
    });

    expect(await repo.findAll()).toHaveLength(0);
    expect((await data()).bar).toStrictEqual("bar");

    await service.apply();

    expect(await repo.findAll()).toHaveLength(3);
    expect((await data()).baz).toStrictEqual(["baz1", "baz2"]);

    await service.rollbackTo("1643205653811-second-migration.ts");

    expect(await repo.findAll()).toHaveLength(2);

    expect((await data()).foo).toStrictEqual(["foo1", "foo2"]);
    expect((await data()).baz).toStrictEqual("baz");

    await service.apply();

    expect(await repo.findAll()).toHaveLength(3);
    expect((await data()).baz).toStrictEqual(["baz1", "baz2"]);
  });
});
