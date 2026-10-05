const DATABASE_NAME = 'apex-polipuntos';
const DATABASE_VERSION = 1;

export const stores = { kv: 'kv', queue: 'queue' } as const;

type StoreName = (typeof stores)[keyof typeof stores];

let connection: Promise<IDBDatabase> | null = null;

const open = () => {
  if (!connection) {
    connection = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB no disponible'));
        return;
      }
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(stores.kv);
        request.result.createObjectStore(stores.queue, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }).catch((error) => {
      connection = null;
      throw error;
    });
  }
  return connection;
};

export async function run<T>(
  store: StoreName,
  mode: IDBTransactionMode,
  operation: (objectStore: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await open();
  return new Promise((resolve, reject) => {
    const request = operation(database.transaction(store, mode).objectStore(store));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
