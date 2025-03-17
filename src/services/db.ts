
// IndexedDB service for persistent storage

// Database configuration
const DB_NAME = 'billiards_app_db';
const DB_VERSION = 1;
const STORES = {
  MATCHES: 'matches',
  SEASONS: 'seasons'
};

// Initialize the database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("IndexedDB error:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.MATCHES)) {
        db.createObjectStore(STORES.MATCHES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.SEASONS)) {
        db.createObjectStore(STORES.SEASONS, { keyPath: 'id' });
      }
    };
  });
};

// Generic function to get all items from a store
const getAllItems = async <T>(storeName: string): Promise<T[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error(`Error getting items from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Failed to get items from ${storeName}:`, error);
    return [];
  }
};

// Generic function to add or update an item in a store
const putItem = async <T>(storeName: string, item: T): Promise<T> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => {
        resolve(item);
      };

      request.onerror = () => {
        console.error(`Error storing item in ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Failed to store item in ${storeName}:`, error);
    throw error;
  }
};

// Generic function to delete an item from a store
const deleteItem = async (storeName: string, id: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error(`Error deleting item from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Failed to delete item from ${storeName}:`, error);
    throw error;
  }
};

// Generic function to clear all items from a store
const clearStore = async (storeName: string): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error(`Error clearing ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`Failed to clear ${storeName}:`, error);
    throw error;
  }
};

// Specific functions for matches
export const getMatches = async () => getAllItems(STORES.MATCHES);
export const saveMatch = async (match: any) => putItem(STORES.MATCHES, match);
export const deleteMatch = async (id: string) => deleteItem(STORES.MATCHES, id);
export const clearMatches = async () => clearStore(STORES.MATCHES);

// Specific functions for seasons
export const getSeasons = async () => getAllItems(STORES.SEASONS);
export const saveSeason = async (season: any) => putItem(STORES.SEASONS, season);
export const deleteSeason = async (id: string) => deleteItem(STORES.SEASONS, id);
export const clearSeasons = async () => clearStore(STORES.SEASONS);

// Function to initialize database for first time
export const initializeDatabase = async () => {
  try {
    await initDB();
    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return false;
  }
};
