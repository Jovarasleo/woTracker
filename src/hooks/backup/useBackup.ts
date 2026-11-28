import { db, type BackupFile } from "../../store/db";
import {
  remapLegacyTables,
  type LegacyTables,
} from "../../store/legacyMigration";
import { t } from "../../i18n/translations";

const BACKUP_APP_ID = "woTracker";

export type TableCounts = Record<string, number>;

export function countBackupRows(backup: BackupFile): TableCounts {
  return Object.fromEntries(
    Object.entries(backup.tables).map(([name, rows]) => [name, rows.length]),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function downloadJson(fileName: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function backupFileName(prefix: string) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  return `${prefix}-${stamp}.json`;
}

/**
 * Normalizes the version stored in a backup to a Dexie schema version. Files
 * made by the app (marked with `app`) store `db.verno`; files made with raw
 * IndexedDB store the native version, which is Dexie's multiplied by 10. The
 * marker decides, not the size of the number: Dexie version 10 is as valid as 9.
 */
function toDexieVersion(version: number, madeByApp: boolean) {
  return madeByApp ? version : version / 10;
}

const FIRST_UUID_VERSION = 10;

const LEGACY_TABLE_NAMES = [
  "workoutTemplates",
  "exerciseTemplates",
  "workoutSessions",
  "exerciseLogs",
  "setLogs",
  "customExercises",
] as const satisfies (keyof LegacyTables)[];

function pickTables(
  rawTables: Record<string, unknown>,
  names: readonly string[],
) {
  return Object.fromEntries(
    names.flatMap((name) => {
      const rows = rawTables[name];
      if (rows === undefined) {
        return [];
      }

      if (!Array.isArray(rows) || !rows.every(isRecord)) {
        throw new Error(t.backup.errors.malformedTable(name));
      }

      return [[name, rows]];
    }),
  );
}

// Rows are only checked to be objects, the same trust a current backup gets
// when its rows go straight into the tables.
function toLegacyTables(tables: BackupFile["tables"]) {
  return Object.fromEntries(
    LEGACY_TABLE_NAMES.map((name) => [name, tables[name] ?? []]),
  ) as unknown as LegacyTables;
}

/**
 * Export and restore all app data as a JSON file. Restoring replaces every
 * table in a single transaction and downloads a backup of the current data
 * first, so nothing is lost if the wrong file is imported.
 */
export function useBackup() {
  const createBackup = async (): Promise<BackupFile> => {
    const tables: BackupFile["tables"] = {};

    await db.transaction("r", db.tables, async () => {
      for (const table of db.tables) {
        tables[table.name] = await table.toArray();
      }
    });

    return {
      app: BACKUP_APP_ID,
      exportedAt: new Date().toISOString(),
      dbVersion: db.verno,
      tables,
    };
  };

  const exportBackup = async (fileNamePrefix = "wotracker-backup") => {
    const backup = await createBackup();
    downloadJson(backupFileName(fileNamePrefix), backup);

    return countBackupRows(backup);
  };

  const parseBackupFile = async (file: File): Promise<BackupFile> => {
    let data: unknown;
    try {
      data = JSON.parse(await file.text());
    } catch {
      throw new Error(t.backup.errors.invalidJson);
    }

    if (!isRecord(data) || !isRecord(data.tables)) {
      throw new Error(t.backup.errors.notABackup);
    }

    if (data.app !== undefined && data.app !== BACKUP_APP_ID) {
      throw new Error(t.backup.errors.otherApp);
    }

    const dbVersion = typeof data.dbVersion === "number" ? data.dbVersion : 0;
    const dexieVersion = toDexieVersion(dbVersion, data.app === BACKUP_APP_ID);
    if (dexieVersion > db.verno) {
      throw new Error(t.backup.errors.newerVersion);
    }

    const isLegacy = dexieVersion < FIRST_UUID_VERSION;
    const tables = pickTables(
      data.tables,
      isLegacy ? LEGACY_TABLE_NAMES : db.tables.map((table) => table.name),
    );

    if (Object.keys(tables).length === 0) {
      throw new Error(t.backup.errors.noData);
    }

    return {
      app: BACKUP_APP_ID,
      exportedAt:
        typeof data.exportedAt === "string" ? data.exportedAt : "unknown",
      dbVersion: isLegacy ? db.verno : dbVersion,
      tables: isLegacy
        ? { ...remapLegacyTables(toLegacyTables(tables)) }
        : tables,
    };
  };

  const restoreBackup = async (backup: BackupFile) => {
    await exportBackup("wotracker-before-import");

    await db.transaction("rw", db.tables, async () => {
      for (const table of db.tables) {
        await table.clear();
        const rows = backup.tables[table.name];
        if (rows?.length) {
          await table.bulkAdd(rows);
        }
      }
    });
  };

  return {
    exportBackup,
    parseBackupFile,
    restoreBackup,
  };
}
