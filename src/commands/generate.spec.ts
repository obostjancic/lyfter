import { generateClassName, generateFilename, generateMigration } from "./generate";

jest.mock("fs/promises");

describe("generateMigration", () => {
  it("should throw an error because the name is not provided", async () => {
    const generatingMigrationWithoutName = async () => generateMigration();

    await expect(generatingMigrationWithoutName).rejects.toThrow("Name not provided!");
  });

  it("should generate a migration", async () => {
    //FIXME write a proper test
    generateMigration("test-migration");
  });
});

describe("generateFilename", () => {
  it("should return the correct filename", () => {
    const epoch = new Date().getTime();
    const name = "test";
    const filename = `${epoch}-${name}.ts`;
    expect(generateFilename(name)).toBe(filename);
  });

  it("should return the correct filename when passed multiple words", () => {
    const epoch = new Date().getTime();
    const name = "test1-test2-test3";
    const filename = `${epoch}-${name}.ts`;
    expect(generateFilename(name)).toBe(filename);
  });
});

describe("generateClassName", () => {
  it("should return the correct class name", () => {
    const name = "test";
    const className = "Test";
    expect(generateClassName(name)).toBe(className);
  });

  it("should return the correct class name when passed multiple words", () => {
    const name = "test1-test2-test3";
    const className = "Test1Test2Test3";
    expect(generateClassName(name)).toBe(className);
  });
});
