
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

    request.onerror = (event) => {
      console.error("Error opening database:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.info("Database initialized successfully");
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create object store for matches if it doesn't exist
      if (!db.objectStoreNames.contains(MATCHES_STORE)) {
        const matchesStore = db.createObjectStore(MATCHES_STORE, { keyPath: "id" });
        console.info("Matches store created");
      }
      
      // Create object store for seasons if it doesn't exist
      if (!db.objectStoreNames.contains(SEASONS_STORE)) {
        const seasonsStore = db.createObjectStore(SEASONS_STORE, { keyPath: "id" });
        console.info("Seasons store created");
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

    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error(`Error in database operation (${storeName}):`, request.error);
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Add or update match
export const addMatch = async (match: Match): Promise<void> => {
  try {
    await withDB<IDBValidKey>(MATCHES_STORE, "readwrite", (store) => {
      console.info(`Saving match with ID: ${match.id}`);
      return store.put(match);
    });
    console.info("Match saved successfully");
  } catch (error) {
    console.error("Failed to save match:", error);
    throw error;
  }
};

// Get all matches
export const getMatches = async (): Promise<Match[]> => {
  try {
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
          console.info("Loaded matches:", matches);
          resolve(matches);
        }
      };
      
      request.onerror = () => {
        console.error("Error loading matches:", request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Failed to get matches:", error);
    return [];
  }
};

// Clear all matches
export const clearMatches = async (): Promise<void> => {
  try {
    await withDB<void>(MATCHES_STORE, "readwrite", (store) => {
      console.info("Clearing all matches");
      return store.clear();
    });
    console.info("Matches cleared successfully");
  } catch (error) {
    console.error("Failed to clear matches:", error);
    throw error;
  }
};

// Add or update season
export const addSeason = async (season: Season): Promise<void> => {
  try {
    await withDB<IDBValidKey>(SEASONS_STORE, "readwrite", (store) => {
      console.info(`Saving season with ID: ${season.id}`);
      return store.put(season);
    });
    console.info("Season saved successfully");
  } catch (error) {
    console.error("Failed to save season:", error);
    throw error;
  }
};

// Get all seasons
export const getSeasons = async (): Promise<Season[]> => {
  try {
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
          console.info("Loaded seasons:", seasons);
          resolve(seasons);
        }
      };
      
      request.onerror = () => {
        console.error("Error loading seasons:", request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Failed to get seasons:", error);
    return [];
  }
};

// Clear all seasons
export const clearSeasons = async (): Promise<void> => {
  try {
    await withDB<void>(SEASONS_STORE, "readwrite", (store) => {
      console.info("Clearing all seasons");
      return store.clear();
    });
    console.info("Seasons cleared successfully");
  } catch (error) {
    console.error("Failed to clear seasons:", error);
    throw error;
  }
};

// Delete specific season
export const deleteSeason = async (seasonId: string): Promise<void> => {
  try {
    await withDB<void>(SEASONS_STORE, "readwrite", (store) => {
      console.info(`Deleting season with ID: ${seasonId}`);
      return store.delete(seasonId);
    });
    console.info("Season deleted successfully");
  } catch (error) {
    console.error("Failed to delete season:", error);
    throw error;
  }
};
