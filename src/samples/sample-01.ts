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

// tslint:disable:no-console

import * as LoC from "../lib";

const locFactory = LoC.getDefaultFactory();

interface IUser {

    id: number;

    userName: string;

    email: string;

    system: string;

    nickName: string;
}

interface IUserIndexes extends LoC.IUniqueIndexes<IUser> {

    "id": {
        "id": number;
    };

    "userName": {

        "userName": string;

        "system": string;
    };

    "email": {

        "email": string;

        "system": string;
    };
}

let zone = locFactory.createZone<IUser, IUserIndexes>({
    name: "users",
    indexes: {
        id: ["id"],
        email: ["system", "email"],
        userName: ["system", "userName"]
    }
});

zone.load([{
    id: 1,
    userName: "admin",
    email: "admin@litert.org",
    nickName: "Administrator",
    system: "A"
}, {
    id: 2,
    userName: "mick",
    email: "mick@litert.org",
    nickName: "Mick",
    system: "A"
}, {
    id: 3,
    userName: "mick",
    email: "mick@litert.org",
    nickName: "Mick",
    system: "B"
}]);

console.log(zone.findOne("id", {
    id: 2
}));

console.log(zone.findOne("userName", {
    userName: "mick",
    system: "B"
}));

if (zone.update("userName", {
    userName: "mick",
    system: "A"
}, {

    id: 2,
    userName: "mick2",
    email: "hey-mick@litert.org",
    nickName: "Mick",
    system: "B"
})) {

    console.log(zone.findOne("email", {
        email: "mick@litert.org",
        system: "A"
    }));

    console.log(zone.findOne("email", {
        email: "hey-mick@litert.org",
        system: "A"
    }));

    console.log(zone.findOne("email", {
        email: "hey-mick@litert.org",
        system: "B"
    }));
}

console.log(zone.remove("id", { id: 2 }));
console.log(zone.findOne("id", { id: 2 }));

zone.flush();

console.log(zone.findOne("email", {
    email: "hey-mick@litert.org",
    system: "B"
}));
