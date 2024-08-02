// utils.js
export const openDB = (name, version) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version);
      request.onsuccess = () => {
        console.log("IndexedDB aberto com sucesso");
        resolve(request.result);
      };
      request.onerror = (event) => {
        console.error("Erro ao abrir IndexedDB", event.target.error);
        reject(event.target.error);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("models")) {
          db.createObjectStore("models");
          console.log("Object store 'models' criado no IndexedDB");
        }
      };
    });
  };
  
  export const getFromDB = (db, storeName, key) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => {
        console.log(`Modelo ${key} obtido do IndexedDB`);
        resolve(request.result);
      };
      request.onerror = (event) => {
        console.error(`Erro ao obter modelo ${key} do IndexedDB`, event.target.error);
        reject(event.target.error);
      };
    });
  };
  
  export const saveToDB = (db, storeName, key, value) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(value, key);
      request.onsuccess = () => {
        console.log(`Modelo ${key} salvo no IndexedDB`);
        resolve();
      };
      request.onerror = (event) => {
        console.error(`Erro ao salvar modelo ${key} no IndexedDB`, event.target.error);
        reject(event.target.error);
      };
    });
  };
  