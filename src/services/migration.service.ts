import { readdir } from "fs/promises";
import { Migration, MigrationConfig, MigrationRecord, MigrationRepository } from "../types";

export class MigrationService {
  private repo: MigrationRepository;

  constructor(private readonly config: MigrationConfig) {
    this.repo = config.migrationRepository;
  }

  public async apply() {
    const appliedMigrations = await this.getAppliedMigrations();
    const allMigrations = await this.getAllMigrations();
    const migrationsToApply = allMigrations.filter(m => !appliedMigrations.find(m2 => m2.name === m.name));

    for (const migration of migrationsToApply) {
      await this.applyMigration(migration);
    }

    return migrationsToApply;
  }

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
      const migrations = await readdir(this.config.migrations);
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
    const migrationModule = await import(`${this.config.migrations}/${migration.name}`);
    const migrationClass = migrationModule.default();
    return new migrationClass();
  }
}
