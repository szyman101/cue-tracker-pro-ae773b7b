
import { Match, Season } from "@/types";

// Nazwa bazy danych
const DB_NAME = "billiards-tracker";
const DB_VERSION = 1;

// Nazwy obiektów przechowywania
const MATCHES_STORE = "matches";
const SEASONS_STORE = "seasons";

// Inicjalizacja bazy danych
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("Błąd podczas otwierania bazy danych");
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Utwórz obiekt przechowywania dla meczów, jeśli nie istnieje
      if (!db.objectStoreNames.contains(MATCHES_STORE)) {
        db.createObjectStore(MATCHES_STORE, { keyPath: "id" });
      }
      
      // Utwórz obiekt przechowywania dla sezonów, jeśli nie istnieje
      if (!db.objectStoreNames.contains(SEASONS_STORE)) {
        db.createObjectStore(SEASONS_STORE, { keyPath: "id" });
      }
    };
  });
};

// Funkcja pomocnicza do wykonywania operacji na bazie danych
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

// Dodaj lub zaktualizuj mecz
export const addMatch = async (match: Match): Promise<void> => {
  await withDB<IDBValidKey>(MATCHES_STORE, "readwrite", (store) => store.put(match));
};

// Pobierz wszystkie mecze
export const getMatches = async (): Promise<Match[]> => {
  return withDB<Match[]>(MATCHES_STORE, "readonly", (store) => {
    const matches: Match[] = [];
    const request = store.openCursor();
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        matches.push(cursor.value);
        cursor.continue();
      }
    };
    
    return request;
  });
};

// Usuń wszystkie mecze
export const clearMatches = async (): Promise<void> => {
  await withDB<void>(MATCHES_STORE, "readwrite", (store) => store.clear());
};

// Dodaj lub zaktualizuj sezon
export const addSeason = async (season: Season): Promise<void> => {
  await withDB<IDBValidKey>(SEASONS_STORE, "readwrite", (store) => store.put(season));
};

// Pobierz wszystkie sezony
export const getSeasons = async (): Promise<Season[]> => {
  return withDB<Season[]>(SEASONS_STORE, "readonly", (store) => {
    const seasons: Season[] = [];
    const request = store.openCursor();
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        seasons.push(cursor.value);
        cursor.continue();
      }
    };
    
    return request;
  });
};

// Usuń wszystkie sezony
export const clearSeasons = async (): Promise<void> => {
  await withDB<void>(SEASONS_STORE, "readwrite", (store) => store.clear());
};

// Usuń konkretny sezon
export const deleteSeason = async (seasonId: string): Promise<void> => {
  await withDB<void>(SEASONS_STORE, "readwrite", (store) => store.delete(seasonId));
};
