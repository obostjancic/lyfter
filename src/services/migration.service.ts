import { readdir } from "fs/promises";
import { join } from "path";
import { Migration, MigrationConfig, MigrationRecord, MigrationRepository } from "../types";

export class MigrationService {
  private repo: MigrationRepository;
  private migrationsDirectory: string;
  constructor(private readonly config: MigrationConfig) {
    this.repo = config.migrationRepository;
    this.migrationsDirectory = this.config.migrations || join(process.cwd(), "migrations");
  }

  /**
   * Get all the migrations that have not been applied, and apply them.
   * @returns The list of migrations that were applied.
   */
  public async apply() {
    const appliedMigrations = await this.getAppliedMigrations();
    const allMigrations = await this.getAllMigrations();
    const migrationsToApply = allMigrations.filter(m => !appliedMigrations.find(m2 => m2.name === m.name));

    for (const migration of migrationsToApply) {
      await this.applyMigration(migration);
    }

    return migrationsToApply;
  }

  /**
   * Rollback all migrations after the one with the given name.
   * @param {string} name - The name of the migration to rollback to.
   * @returns The rolled migrations.
   */
  public async rollbackTo(name: string) {
    const appliedMigrations = await this.getAppliedMigrations();
    const rollbackIndex = appliedMigrations.findIndex(m => m.name === name);
    const migrationsToRollback = appliedMigrations.slice(rollbackIndex + 1);
    const reversedMigrations = migrationsToRollback.reverse();

    for (const migration of reversedMigrations) {
      await this.rollbackMigration(migration);
    }

    return reversedMigrations;
  }

  private async getAppliedMigrations(): Promise<MigrationRecord[]> {
    return this.repo.findAll();
  }

  private async getAllMigrations(): Promise<MigrationRecord[]> {
    try {
      const migrations = await readdir(this.migrationsDirectory);
      const sortedMigrations = migrations.sort();
      return sortedMigrations.map(m => {
        return {
          name: m,
        };
      });
    } catch (e) {
      throw new Error("No migrations found!");
    }
  }

  private async applyMigration(migration: MigrationRecord) {
    const migrationClass = await this.getMigrationInstance(migration);
    await migrationClass.up();
    await this.repo.create(migration);
  }

  private async rollbackMigration(migration: MigrationRecord) {
    const migrationClass = await this.getMigrationInstance(migration);
    await migrationClass.down();
    await this.repo.delete(migration);
  }

  private async getMigrationInstance(migration: MigrationRecord): Promise<Migration> {
    const migrationModule = await import(join(this.migrationsDirectory, migration.name));
    const migrationClass = migrationModule.default;
    return new migrationClass();
  }
}
