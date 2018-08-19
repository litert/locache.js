/**
 *  Copyright 2018 Angus.Fenying <fenying@litert.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

export type IIndexOptions<T, I extends IUniqueIndexes<T>> = {

    [K in keyof I]: Array<keyof I[K]> | ((v: I[K]) => string);
};

export interface IUniqueIndexes<T> {

    [key: string]: {

        [K in keyof T]?: T[K];
    };
}

/**
 * The cache storage zone.
 */
export interface IZone<T, I extends {}> {

    /**
     * The name of cache zone.
     */
    readonly name: string;

    /**
     * The quantity of items.
     */
    readonly length: number;

    /**
     * Find an item in cache.
     *
     * Return **undefined** if nothing found.
     *
     * @param index The name of index method to be searched.
     * @param entry The identity to be searched.
     */
    findOne<K extends keyof I>(index: K, entry: I[K]): T | void;

    /**
     * Get the list of all items in cache.
     */
    findAll(): T[];

    /**
     * Remove all items in cache.
     */
    flush(): this;

    /**
     * Remove an item in cache.
     *
     * @param index The name of index method to be searched.
     * @param entry The identity to be searched.
     */
    remove<K extends keyof I>(index: K, entry: I[K]): boolean;

    /**
     * Update an item in cache.
     *
     * @param index The name of index method to be searched.
     * @param entry The identity to be searched.
     * @param value The new value of the item.
     */
    update<K extends keyof I>(
        index: K,
        entry: I[K],
        value: T
    ): boolean;

    /**
     * Insert an item into cache.
     *
     * Return false if the item doesn't match the unique indexes constraint.
     *
     * @param value The item to be inserted.
     */
    insert(value: T): boolean;

    /**
     * Check if an item exists.
     *
     * @param index The name of index method to be searched.
     * @param entry The identity to be searched.
     */
    exist<K extends keyof I>(index: K, entry: I[K]): boolean;

    /**
     * Load the list of items into cache.
     *
     * @param items The list of items to be inserted into cache.
     */
    load(items: T[]): boolean;
}

export interface ICreateZoneOptions<T, I extends IUniqueIndexes<T>> {

    name: string;

    indexes: IIndexOptions<T, I>;
}

export interface IFactory {

    /**
     * Get a created storage zone by its name.
     *
     * @param name The name of the zone.
     */
    getZone<T, I extends IUniqueIndexes<T>>(name: string): IZone<T, I>;

    /**
     * Create a new storage zone.
     *
     * @param name      The name of the zone to be created.
     * @param indexes   The index method of the zone.
     */
    createZone<T, I extends IUniqueIndexes<T>>(
        options: ICreateZoneOptions<T, I>
    ): IZone<T, I>;
}
