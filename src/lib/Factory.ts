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
import Zone from "./Zone";

class Factory
implements C.IFactory {

    private _zones: Record<string, any>;

    public constructor() {

        this._zones = {};
    }

    public getZone<
        T, I extends C.IUniqueIndexes<T>
    >(name: string): C.IZone<T, I> {

        if (!this._zones[name]) {

            throw new Error(`Local cache zone "${name}" doesn't exist.`);
        }

        return this._zones[name];
    }

    public createZone<
        T, I extends C.IUniqueIndexes<T>
    >(options: C.ICreateZoneOptions<T, I>): C.IZone<T, I> {

        if (this._zones[options.name]) {

            throw new Error(
                `Local cache zone "${options.name}" already exist.`
            );
        }

        return this._zones[options.name] = new Zone(options);
    }
}

export function createFactory(): C.IFactory {

    return new Factory();
}

const defaultFactory: C.IFactory = createFactory();

export function getDefaultFactory(): C.IFactory {

    return defaultFactory;
}
