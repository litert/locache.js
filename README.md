# LiteRT/LoCache

[![npm version](https://img.shields.io/npm/v/@litert/locache.svg?colorB=brightgreen)](https://www.npmjs.com/package/@litert/locache "Stable Version")
[![License](https://img.shields.io/npm/l/@litert/locache.svg?maxAge=2592000?style=plastic)](https://github.com/litert/locache/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@litert/locache.svg?colorB=brightgreen)](https://nodejs.org/dist/latest-v8.x/)
[![GitHub issues](https://img.shields.io/github/issues/litert/locache.js.svg)](https://github.com/litert/locache.js/issues)
[![GitHub Releases](https://img.shields.io/github/release/litert/locache.js.svg)](https://github.com/litert/locache.js/releases "Stable Release")

A local cache management library.

## Requirement

- TypeScript v2.9.2 (or newer)

## Installation

```sh
npm i @litert/locache --save
```

## Usage

```ts
import * as LoC from "@litert/locache";

const factory = LoC.getDefaultFactory(); // or LoC.createFactory();

/**
 * The data to be stored in cache.
 */
interface ICategory {

    id: number;

    title: string;

    key: string;

    parent: number;
}

/**
 * This way to declare the signatures of indexes.
 */
interface ICategoryIndexes
extends LoC.IUniqueIndexes<ICategory> {

    primaryKey: { // Indexed by single key

        "id": number;
    };

    theKey: { // Indexed by multi key

        key: string;

        parent: number;
    };
}

const catZone = factory.createZone<ICategory, ICategoryIndexes>({

    name: "categories",

    /**
     * Setup the indexes info.
     *
     * Now there is only unique indexes supported.
     *
     * Thus only a key builder is necessary for the indexes.
     */
    indexes: {

        /**
         * Use a custom function to build the key of cache item.
         */
        primaryKey: function(entry): string {

            return `/id/${entry.id}`;
        },

        /**
         * Or use built-in key builder with the fields' names.
         */
        theKey: [ "key", "parent" ]
    };
});

/**
 * Insert multi items into cache.
 */
zone.load([
    { id: 1, title: "Development", key: "dev", parent: 0 },
    { id: 2, title: "Designment", key: "design", parent: 0 },
    { id: 3, title: "C/C++", key: "cpp", parent: 1 }
]);

/**
 * Insert single item into cache.
 */
zone.insert({ id: 4, title: "JavaScript", key: "js", parent: 1 });
zone.insert({ id: 5, title: "Photoshop", key: "ps", parent: 2 });

/**
 * Find an item by the index
 */
const item = zone.findOne("primaryKey", { id: 3 });

if (item) {

    zone.update("primaryKey", { id: 3 }, {
        id: 3,
        title: "Java",
        key: "java",
        parent: 1
    });

    item = zone.find("theKey", {
        "key": "java",
        "parent": 1
    });
}

/**
 * Or find all items in cache.
 */
zone.findAll();

console.log(`There are ${zone.length} items in cache.`);

/**
 * Remove single item in cache.
 */
zone.remove("theKey", { key: "ps", parent: 2 });

/**
 * Remove all items in cache.
 */
zone.flush();
```

## License

[License-Link]: https://www.apache.org/licenses/LICENSE-2.0

This library is published under [Apache-2.0][License-Link] license.
