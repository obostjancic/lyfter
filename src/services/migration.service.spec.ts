import { Migration, MigrationRepository } from "..";
import { MigrationService } from "./migration.service";

const mockRepo: MigrationRepository = {
  create: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
};

const mockMigration: Migration = {
  up: jest.fn(),
  down: jest.fn(),
};

const mockPrivateAsync = (proto: any, functionName: string, returnVal: any) =>
  jest.spyOn(proto.prototype as any, functionName).mockImplementation(async () => returnVal);

describe("MigrationService", () => {
  let service: MigrationService;

  beforeEach(() => {
    service = new MigrationService({ migrationRepository: mockRepo, migrations: "" });
  });

  describe("apply", () => {
    it("should throw an error if there are no migrations to apply", async () => {
      jest.spyOn(mockRepo, "findAll").mockImplementation(async () => []);

      const applyingNonexistantMigrations = async () => service.apply();
      await expect(applyingNonexistantMigrations).rejects.toThrowError("No migrations found!");
    });

    it("should do nothing if all migrations are already applied", async () => {
      jest.spyOn(mockRepo, "findAll").mockImplementation(async () => []);
      mockPrivateAsync(MigrationService, "getAllMigrations", []);

      const appliedMigrations = await service.apply();

      expect(appliedMigrations).toStrictEqual([]);
    });

    it("should apply one migration", async () => {
      const firstMigration = { name: "firstMigration" };

      jest.spyOn(mockRepo, "findAll").mockImplementation(async () => []);
      mockPrivateAsync(MigrationService, "getAllMigrations", [firstMigration]);
      mockPrivateAsync(MigrationService, "getMigrationInstance", mockMigration);

      const appliedMigrations = await service.apply();

      expect(appliedMigrations).toStrictEqual([firstMigration]);
    });

    it("should apply skip one and apply one migration", async () => {
      const firstMigration = { name: "firstMigration" };
      const secondMigration = { name: "secondMigration" };
      jest.spyOn(mockRepo, "findAll").mockImplementation(async () => [firstMigration]);
      mockPrivateAsync(MigrationService, "getAllMigrations", [firstMigration, secondMigration]);
      mockPrivateAsync(MigrationService, "getMigrationInstance", mockMigration);

      const appliedMigrations = await service.apply();

      expect(appliedMigrations).toStrictEqual([secondMigration]);
    });
  });

  describe("rollbackTo", () => {
    it("should rollback to specified migration", async () => {
      const firstMigration = { name: "firstMigration" };
      const secondMigration = { name: "secondMigration" };
      jest.spyOn(mockRepo, "findAll").mockImplementation(async () => [firstMigration, secondMigration]);
      mockPrivateAsync(MigrationService, "getAllMigrations", [firstMigration, secondMigration]);
      mockPrivateAsync(MigrationService, "getMigrationInstance", mockMigration);

      const rolledMigrations = await service.rollbackTo("firstMigration");

      expect(rolledMigrations).toStrictEqual([secondMigration]);
    });
  });
});
