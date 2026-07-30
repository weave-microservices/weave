import { mock } from "node:test";

interface StoredDocument {
  _id: number;
  key: string;
  expiresAt: number;
  metadata: Record<string, unknown>;
}

type Filter = Record<string, unknown>;

export interface MongoMock {
  /** Connection string the client was constructed with. */
  url?: string;
  connectCalls: number;
  closeCalls: number;
  /** Collections that existed before `connect()` ran. */
  existingCollections: string[];
  createdCollections: string[];
  /** Name of the collection the adapter works on. */
  collectionName?: string;
  documents: StoredDocument[];
}

/**
 * Evaluates the small subset of the MongoDB query language the adapter uses:
 * equality plus the `$lt` and `$gte` operators.
 */
const matches = (document: StoredDocument, filter: Filter): boolean =>
  Object.entries(filter).every(([field, condition]) => {
    const value = document[field as keyof StoredDocument];

    if (condition && typeof condition === "object") {
      return Object.entries(condition as Record<string, number>).every(([operator, operand]) => {
        switch (operator) {
          case "$lt":
            return (value as number) < operand;
          case "$gte":
            return (value as number) >= operand;
          default:
            throw new Error(`Unsupported query operator: ${operator}`);
        }
      });
    }

    return value === condition;
  });

const createMongoMock = () => {
  const state: MongoMock = {
    connectCalls: 0,
    closeCalls: 0,
    existingCollections: [],
    createdCollections: [],
    documents: [],
  };

  let nextId = 1;

  const collection = {
    find(filter: Filter = {}) {
      return {
        toArray: async () => state.documents.filter((document) => matches(document, filter)),
      };
    },
    async findOne(filter: Filter = {}) {
      return state.documents.find((document) => matches(document, filter)) ?? null;
    },
    async insertOne(document: Omit<StoredDocument, "_id">) {
      const stored = { ...document, _id: nextId++ };
      state.documents.push(stored);
      return { insertedId: stored._id };
    },
    async deleteOne(filter: { _id: number }) {
      const index = state.documents.findIndex((document) => document._id === filter._id);

      if (index !== -1) {
        state.documents.splice(index, 1);
      }

      return { deletedCount: index === -1 ? 0 : 1 };
    },
    async updateOne(filter: { _id: number }, update: { $set: Partial<StoredDocument> }) {
      const document = state.documents.find((entry) => entry._id === filter._id);

      if (document) {
        Object.assign(document, update.$set);
      }

      return { modifiedCount: document ? 1 : 0 };
    },
  };

  const db = {
    listCollections: () => ({
      toArray: async () => state.existingCollections.map((name) => ({ name })),
    }),
    async createCollection(name: string) {
      state.createdCollections.push(name);
      state.existingCollections.push(name);
    },
    collection(name: string) {
      state.collectionName = name;
      return collection;
    },
  };

  class MongoClientMock {
    constructor(url: string) {
      state.url = url;
    }

    async connect() {
      state.connectCalls++;
    }

    async close() {
      state.closeCalls++;
    }

    db() {
      return db;
    }
  }

  return { state, MongoClientMock };
};

let current = createMongoMock();

/**
 * Registers the module mock for the `mongodb` package. Must be called once
 * before the adapter is imported; use the returned `reset` function to get a
 * fresh database state per test.
 */
export const installMongoMock = (): { reset: () => MongoMock } => {
  mock.module("mongodb", {
    namedExports: {
      MongoClient: function MongoClient(url: string) {
        return new current.MongoClientMock(url);
      },
    },
  });

  return {
    reset: () => {
      current = createMongoMock();
      return current.state;
    },
  };
};
