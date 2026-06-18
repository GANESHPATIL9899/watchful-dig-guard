/**
 * Generic repository contract. Each domain repository implements this and
 * has two flavors (mock | http) selected by env.USE_MOCK.
 */
export interface Repository<T, ID = string> {
  getAll(): Promise<T[]>;
  getById(id: ID): Promise<T | undefined>;
  create(item: Omit<T, "id">): Promise<T>;
  update(id: ID, patch: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
}

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}

export function inMemoryRepo<T extends { id: string }>(seed: T[]): Repository<T> {
  let data = [...seed];
  return {
    getAll: () => delay([...data]),
    getById: (id) => delay(data.find((x) => x.id === id)),
    create: (item) => {
      const created = { ...(item as T), id: `${Date.now()}` };
      data = [created, ...data];
      return delay(created);
    },
    update: (id, patch) => {
      data = data.map((x) => (x.id === id ? { ...x, ...patch } : x));
      return delay(data.find((x) => x.id === id)!);
    },
    delete: (id) => {
      data = data.filter((x) => x.id !== id);
      return delay(undefined as unknown as void);
    },
  };
}
