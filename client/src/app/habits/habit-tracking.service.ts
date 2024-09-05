import { Injectable } from "@angular/core";

const DB_NAME = "HabiDB";
const STORE_NAME = "habit_tracking";

type HabitEntry = {
    id: string;
    startTime: number;
    timeTracked: number;
    isTracking: boolean;
};

class PromiseResolver<T> {
    private resolveFn?: (value: T) => void;
    private rejectFn?: (reason?: unknown) => void;

    promise: Promise<T> = new Promise((resolve, reject) => {
        this.resolveFn = resolve;
        this.rejectFn = reject;
    });

    resolve(value: T) {
        this.resolveFn?.(value);
    }

    reject(reason: unknown) {
        this.rejectFn?.(reason);
    }
}

@Injectable({
    providedIn: "root"
})
export class HabitTrackingService {
    databaseInitialized = new PromiseResolver<void>();
    private db?: IDBDatabase;

    constructor() {
        this.initDB();
    }

    async startTrackingHabit(habitId: string): Promise<number> {
        const habitEntry = await this.getHabitTrackingEntry(habitId);
        if (habitEntry) {
            console.log("resuming tracking");
            habitEntry.startTime = Date.now();
            habitEntry.isTracking = true;
            await this.updateHabitTrackingEntry(habitEntry);
            return habitEntry.timeTracked;
        } else {
            console.log("start new tracking");
            await this.addHabitTrackingEntry(habitId);
            return 0;
        }
    }

    async stopTrackingHabit(habitId: string) {
        console.log("stop tracking");
        const habitEntry = await this.getHabitTrackingEntry(habitId);
        if (!habitEntry) {
            throw new Error("Trying to stop tracking a habit that is not being tracked");
        }
        if (habitEntry.isTracking) {
            const timeTracked = (Date.now() - habitEntry.startTime) / 60000;
            habitEntry.timeTracked += timeTracked;
            habitEntry.isTracking = false;
            await this.updateHabitTrackingEntry(habitEntry);
        }
        return habitEntry.timeTracked;
    }

    getHabitTrackingEntry(habitId: string) {
        return this.transactionPromise<HabitEntry>("readonly", (store) => store.get(habitId));
    }

    getAllHabitTrackingEntries() {
        return this.transactionPromise<HabitEntry[]>("readonly", (store) => store.getAll());
    }

    private async addHabitTrackingEntry(habitId: string) {
        const habitEntry: HabitEntry = {
            id: habitId,
            startTime: Date.now(),
            timeTracked: 0,
            isTracking: true
        };

        try {
            await this.transactionPromise("readwrite", (store) => store.add(habitEntry));
            console.log("Habit entry added successfully");
        } catch (error) {
            console.error("Error tracking habit: ", error);
        }
        return habitEntry;
    }

    private async updateHabitTrackingEntry(habitEntry: HabitEntry) {
        // return this.transactionPromise<IDBValidKey>("readwrite", (store) => store.put(habitEntry));
        try {
            await this.transactionPromise<IDBValidKey>("readwrite", (store) => store.put(habitEntry));
            console.log("Habit entry updated successfully");
        } catch (error) {
            console.error("Error updating habit entry: ", error);
        }
        return habitEntry;
    }

    private deleteHabitTrackingEntry(habitEntryId: string) {
        return this.transactionPromise<undefined>("readwrite", (store) => store.delete(habitEntryId));
    }

    private initDB() {
        const openRequest = indexedDB.open(DB_NAME, 1);
        openRequest.onupgradeneeded = () => {
            const db = openRequest.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        openRequest.onsuccess = () => {
            this.db = openRequest.result;
            this.db.onerror = (event: any) => {
                // Generic error handler for all errors targeted at this database's
                // requests!
                console.error(`Database error: ${event.target?.error?.message}`);
            };
            console.log("Database opened successfully");
            this.databaseInitialized.resolve();
        };

        openRequest.onerror = () => {
            console.error("Error opening database", openRequest.error);
            this.databaseInitialized.reject(openRequest.error);
        };
    }

    private transactionPromise<T>(
        mode: IDBTransactionMode,
        callback: (store: IDBObjectStore) => IDBRequest<T>
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject("Database not initialized");
            }

            const transaction = this.db.transaction([STORE_NAME], mode);
            const store = transaction.objectStore(STORE_NAME);
            const request = callback(store);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}
