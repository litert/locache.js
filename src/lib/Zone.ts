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

import * as C from "./Common";

type IIndexKeyMethods<T, I extends C.IUniqueIndexes<T>> = {

    [K in keyof I]: ((v: I[K]) => string);
};

export class Zone<T, I extends C.IUniqueIndexes<T>>
implements C.IZone<T, I> {

    private _name: string;

    private _items: T[];

    private _indexes: Record<string, T>;

    private _indexKeyBuilders: IIndexKeyMethods<T, I>;

    private _mapItem2Indexes: Map<T, string[]>;

    public constructor(
        options: C.ICreateZoneOptions<T, I>
    ) {

        this._items = [];

        this._indexes = {};

        this._name = options.name;

        this._indexKeyBuilders = {} as any;

        this._mapItem2Indexes = new Map();

        for (let k in options.indexes) {

            if (typeof options.indexes[k] === "function") {

                this._indexKeyBuilders[k] = options.indexes[k] as any;
            }
            else {

                const fields: string[] = [];

                for (let x of options.indexes[k] as Array<keyof T>) {

                    fields.push(`${x}:\${v["${x}"]}`);
                }

                this._indexKeyBuilders[k] = new Function(
                    "v",
                    `return \`${fields.join(":")}\`;`
                ) as any;
            }
        }
    }

    public get length(): number {

        return this._items.length;
    }

    public get name(): string {

        return this._name;
    }

    public findAll(): T[] {

        return this._items.slice();
    }

    public flush(): this {

        this._items = [];
        this._indexes = {};
        return this;
    }

    public findOne<K extends keyof I>(index: K, entry: I[K]): T | void {

        return this._findOne(index, entry);
    }

    private _findOne<K extends keyof I>(index: K, entry: I[K]): T | void {

        const ret = this._indexes[this._indexKeyBuilders[index](entry)];

        return ret;
    }

    public update<K extends keyof I>(
        index: K,
        entry: I[K],
        value: T
    ): boolean {

        // First, find the item

        const item = this._findOne(index, entry);

        if (item === undefined) {

            return false;
        }

        const keys: string[] = [];

        // Check conflicts.

        for (const indexKey in this._indexKeyBuilders) {

            const key = this._indexKeyBuilders[indexKey](value);

            if (
                this._indexes[key] !== undefined &&
                this._indexes[key] !== item
            ) {

                return false;
            }

            keys.push(key);
        }

        // Removed old data and indexes

        for (const k of this._mapItem2Indexes.get(item) as string[]) {

            delete this._indexes[k];
        }

        this._mapItem2Indexes.delete(item);

        // Created new indexes.

        this._mapItem2Indexes.set(value, keys);

        for (const k of keys) {

            this._indexes[k] = value;
        }

        this._items[this._items.indexOf(item)] = value;

        return true;
    }

    public remove<K extends keyof I>(index: K, entry: I[K]): boolean {

        const item = this._findOne(index, entry);

        if (item === undefined) {

            return false;
        }

        this._items.splice(this._items.indexOf(item), 1);

        for (const k of this._mapItem2Indexes.get(item) as string[]) {

            delete this._indexes[k];
        }

        return true;
    }

    public exist<K extends keyof I>(index: K, entry: I[K]): boolean {

        return this._findOne(index, entry) !== undefined;
    }

    public insert<K extends keyof I>(item: T): boolean {

        const keys: string[] = [];

        if (this._mapItem2Indexes.has(item)) {

            return false;
        }

        for (const indexKey in this._indexKeyBuilders) {

            const key = this._indexKeyBuilders[indexKey](item);

            if (this._indexes[key] !== undefined) {

                return false;
            }

            keys.push(key);
        }

        this._mapItem2Indexes.set(item, keys);

        for (let key of keys) {

            this._indexes[key] = item;
        }

        this._items.push(item);

        return true;
    }

    public load(items: T[]): boolean {

        const indexes: Record<string, T> = {};

        const maps: Array<{

            item: T;

            keys: string[];

        }> = [];

        for (let item of items) {

            if (this._mapItem2Indexes.has(item)) {

                return false;
            }

            const keys: string[] = [];

            for (const indexKey in this._indexKeyBuilders) {

                const key = this._indexKeyBuilders[indexKey](item);

                if (this._indexes[key] !== undefined) {

                    return false;
                }

                indexes[key] = item;
                keys.push(key);
            }

            maps.push({
                keys,
                item
            });
        }

        for (let key in indexes) {

            this._indexes[key] = indexes[key];
        }

        for (let map of maps) {

            this._mapItem2Indexes.set(map.item, map.keys);
        }

        this._items = this._items.concat(items);

        return true;
    }
}

export default Zone;
