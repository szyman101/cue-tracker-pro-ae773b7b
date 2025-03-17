
import { Match } from "@/types";

// Save match to local IndexedDB as fallback
export const saveLocalMatch = async (match: Match): Promise<void> => {
  try {
    // Use the local IndexedDB database to save the match
    const request = window.indexedDB.open("billiards-tracker", 1);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains("matches")) {
        db.createObjectStore("matches", { keyPath: "id" });
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("matches", "readwrite");
      const store = transaction.objectStore("matches");
      store.put(match);
      console.log("Match saved to local IndexedDB successfully");
    };
    
    request.onerror = (error) => {
      console.error("Error opening IndexedDB:", error);
    };
  } catch (localError) {
    console.error("Error saving match to local IndexedDB:", localError);
  }
};

// Retrieve matches from local IndexedDB
export const getLocalMatches = async (): Promise<Match[]> => {
  return new Promise((resolve, reject) => {
    try {
      const request = window.indexedDB.open("billiards-tracker", 1);
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains("matches")) {
          db.createObjectStore("matches", { keyPath: "id" });
        }
      };
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("matches", "readonly");
        const store = transaction.objectStore("matches");
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result as Match[]);
        };
        
        getAllRequest.onerror = (error) => {
          console.error("Error retrieving matches from IndexedDB:", error);
          resolve([]);
        };
      };
      
      request.onerror = (error) => {
        console.error("Error opening IndexedDB:", error);
        resolve([]);
      };
    } catch (error) {
      console.error("Error in getLocalMatches:", error);
      resolve([]);
    }
  });
};
