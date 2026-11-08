import { db, type BackupFile } from "../../store/db";

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
 * made by the app store `db.verno` (e.g. 9); files made with raw IndexedDB
 * store the native version, which Dexie multiplies by 10 (e.g. 90).
 */
function toDexieVersion(version: number) {
  return version >= 10 ? version / 10 : version;
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

  // Reads and validates a backup file without touching the database.
  const parseBackupFile = async (file: File): Promise<BackupFile> => {
    let data: unknown;
    try {
      data = JSON.parse(await file.text());
    } catch {
      throw new Error("This file is not valid JSON.");
    }

    if (!isRecord(data) || !isRecord(data.tables)) {
      throw new Error("This file is not a woTracker backup.");
    }

    if (data.app !== undefined && data.app !== BACKUP_APP_ID) {
      throw new Error("This backup was made by a different app.");
    }

    const dbVersion = typeof data.dbVersion === "number" ? data.dbVersion : 0;
    if (toDexieVersion(dbVersion) > db.verno) {
      throw new Error(
        "This backup was made by a newer version of the app. Update the app and try again.",
      );
    }

    const knownTables = new Set(db.tables.map((table) => table.name));
    const tables: BackupFile["tables"] = {};

    for (const [name, rows] of Object.entries(data.tables)) {
      if (!knownTables.has(name)) {
        continue;
      }

      if (!Array.isArray(rows) || !rows.every(isRecord)) {
        throw new Error(`Table "${name}" in this backup is malformed.`);
      }

      tables[name] = rows;
    }

    if (Object.keys(tables).length === 0) {
      throw new Error("This backup contains no woTracker data.");
    }

    return {
      app: BACKUP_APP_ID,
      exportedAt:
        typeof data.exportedAt === "string" ? data.exportedAt : "unknown",
      dbVersion,
      tables,
    };
  };

  const restoreBackup = async (backup: BackupFile) => {
    // Safety net: keep a copy of what is about to be replaced.
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
