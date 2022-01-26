export interface Migration {
  up: (...args: any[]) => Promise<void>;
  down: (...args: any[]) => Promise<void>;
}

export type MigrationRecord = { name: string };

export type MigrationConfig = {
  migrations?: string;
  migrationRepository: MigrationRepository;
};

export interface MigrationRepository {
  findAll(): Promise<MigrationRecord[]>;
  create(migration: MigrationRecord): Promise<void>;
  delete(migration: MigrationRecord): Promise<void>;
}
