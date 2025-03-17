
import { Match, Season } from "@/types";

// Database name
const DB_NAME = "billiards-tracker";
const DB_VERSION = 1;

// Store names
const MATCHES_STORE = "matches";
const SEASONS_STORE = "seasons";

// Initialize the database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("Error opening database");
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create object store for matches if it doesn't exist
      if (!db.objectStoreNames.contains(MATCHES_STORE)) {
        db.createObjectStore(MATCHES_STORE, { keyPath: "id" });
      }
      
      // Create object store for seasons if it doesn't exist
      if (!db.objectStoreNames.contains(SEASONS_STORE)) {
        db.createObjectStore(SEASONS_STORE, { keyPath: "id" });
      }
    };
  });
};

// Helper function for database operations
const withDB = async <T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = callback(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Add or update match
export const addMatch = async (match: Match): Promise<void> => {
  await withDB<IDBValidKey>(MATCHES_STORE, "readwrite", (store) => store.put(match));
};

// Get all matches
export const getMatches = async (): Promise<Match[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(MATCHES_STORE, "readonly");
    const store = transaction.objectStore(MATCHES_STORE);
    const matches: Match[] = [];
    
    const request = store.openCursor();
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        matches.push(cursor.value);
        cursor.continue();
      } else {
        // When all results have been processed (cursor is null)
        resolve(matches);
      }
    };
    
    request.onerror = () => {
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Clear all matches
export const clearMatches = async (): Promise<void> => {
  await withDB<void>(MATCHES_STORE, "readwrite", (store) => store.clear());
};

// Add or update season
export const addSeason = async (season: Season): Promise<void> => {
  await withDB<IDBValidKey>(SEASONS_STORE, "readwrite", (store) => store.put(season));
};

// Get all seasons
export const getSeasons = async (): Promise<Season[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SEASONS_STORE, "readonly");
    const store = transaction.objectStore(SEASONS_STORE);
    const seasons: Season[] = [];
    
    const request = store.openCursor();
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        seasons.push(cursor.value);
        cursor.continue();
      } else {
        // When all results have been processed (cursor is null)
        resolve(seasons);
      }
    };
    
    request.onerror = () => {
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Clear all seasons
export const clearSeasons = async (): Promise<void> => {
  await withDB<void>(SEASONS_STORE, "readwrite", (store) => store.clear());
};

// Delete specific season
export const deleteSeason = async (seasonId: string): Promise<void> => {
  await withDB<void>(SEASONS_STORE, "readwrite", (store) => store.delete(seasonId));
};
