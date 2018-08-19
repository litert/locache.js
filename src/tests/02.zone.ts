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

import { assert } from "chai";
import * as LoC from "../lib";

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

describe("Zone", function() {

    const factory = LoC.getDefaultFactory();

    const zone = factory.createZone<IUser, IUserIndexes>({

        name: "users",
        indexes: {
            id: ["id"],
            email: ["system", "email"],
            userName: ["system", "userName"]
        }
    });

    describe("Zone.name", function() {

        it("The name should be 'users'.", function() {

            assert.equal("users", zone.name);
        });
    });

    describe("Zone.load", function() {

        it("should return true without conflicted items", function() {

            assert.equal(true, zone.load([{
                id: 1,
                userName: "admin",
                nickName: "Administrator",
                email: "admin@litert.org",
                system: "A"
            }, {
                id: 2,
                userName: "admin",
                nickName: "Administrator",
                email: "admin@litert.org",
                system: "B"
            }, {
                id: 3,
                userName: "mick",
                nickName: "Mick",
                email: "mick@litert.org",
                system: "A"
            }]));
        });

        it("All items above is inserted", function() {

            let item1 = zone.findOne("id", { "id": 1 });
            let item2 = zone.findOne("userName", {
                "userName": "admin",
                "system": "A"
            });
            let item3 = zone.findOne("id", { "id": 3 });

            assert.equal(
                "Administrator",
                item1 && item1.nickName
            );

            assert.equal(
                "Administrator",
                item2 && item2.nickName
            );

            assert.equal(
                "Mick",
                item3 && item3.nickName
            );
        });

        it("should return false with conflicted items", function() {

            assert.equal(false, zone.load([{
                id: 1,
                userName: "admin",
                nickName: "Administrator",
                email: "admin@litert.org",
                system: "A"
            }, {
                id: 4,
                userName: "nick",
                nickName: "Nick",
                email: "nick@litert.org",
                system: "A"
            }]));
        });

        it("and the ID 4 is not inserted", function() {

            assert.equal(undefined, zone.findOne("id", { "id": 4 }));
        });

        it("should return true without conflicted items", function() {

            assert.equal(true, zone.load([{
                id: 4,
                userName: "nick",
                nickName: "Nick",
                email: "nick@litert.org",
                system: "A"
            }]));
        });

        it("and the ID 4 is inserted", function() {

            const item = zone.findOne("id", { "id": 4 });

            assert.notEqual(undefined, item);
            assert.equal("Nick", item && item.nickName);
        });
    });

    describe("Zone.length", function() {

        it("now the length should be 4", function() {

            assert.equal(4, zone.length);
        });
    });

    describe("Zone.findOne", function() {

        it("by an okay index entry", function() {

            assert.notEqual(undefined, zone.findOne("id", { id: 1 }));
            assert.notEqual(undefined, zone.findOne("userName", {
                userName: "admin",
                system: "A"
            }));
        });

        it("by a non-existed index entry", function() {

            assert.equal(undefined, zone.findOne("id", { id: 221 }));
            assert.equal(undefined, zone.findOne("userName", {
                userName: "admin",
                system: "C"
            }));
        });
    });

    describe("Zone.findAll", function() {

        it("should return 4 items", function() {

            assert.equal(4, zone.findAll().length);
            assert.equal("admin", zone.findAll()[0].userName);
            assert.equal("mick", zone.findAll()[2].userName);
        });
    });

    describe("Zone.insert", function() {

        it("should return true without conflicts", function() {

            assert.equal(true, zone.insert({
                id: 5,
                userName: "alexia",
                nickName: "Alexia",
                email: "alexia@litert.org",
                system: "A"
            }));
            assert.notEqual(undefined, zone.findOne("id", {
                id: 5
            }));
        });

        it("should return false with conflicts", function() {

            assert.equal(false, zone.insert({
                id: 5,
                userName: "park",
                nickName: "Park",
                email: "park@litert.org",
                system: "A"
            }));

            const item = zone.findOne("id", {
                id: 5
            });

            assert.notEqual(undefined, item);
            assert.notEqual("park", item && item.userName);
        });

        it("now the length should be 5", function() {

            assert.equal(5, zone.length);
        });
    });

    describe("Zone.remove", function() {

        it("by an okay index entry", function() {

            assert.equal(true, zone.remove("id", { id: 2 }));
            assert.equal(undefined, zone.findOne("id", { id: 2 }));
            assert.equal(true, zone.remove("userName", {
                userName: "admin",
                system: "A"
            }));
            assert.equal(undefined, zone.findOne("userName", {
                userName: "admin",
                system: "A"
            }));
        });

        it("now the length should be 3", function() {

            assert.equal(3, zone.length);
        });

        it("by a non-existed index entry", function() {

            assert.equal(false, zone.remove("id", { id: 221 }));
            assert.equal(false, zone.remove("userName", {
                userName: "admin",
                system: "C"
            }));
        });
    });

    describe("Zone.update", function() {

        it("should return true without conflicts", function() {

            assert.equal(true, zone.update("id", { id: 5 }, {
                id: 123,
                userName: "alexia",
                nickName: "Alexia",
                email: "alexia@gmail.com",
                system: "C"
            }));
            assert.equal(undefined, zone.findOne("id", { id: 5 }));
            assert.notEqual(undefined, zone.findOne("id", { id: 123 }));
        });

        it("should return false with conflicts", function() {

            assert.equal(false, zone.update("id", { id: 3 }, {
                id: 3,
                userName: "alexia",
                nickName: "Mick",
                email: "mick@litert.org",
                system: "C"
            }));

            const item = zone.findOne("id", { id: 3 });

            assert.notEqual(undefined, item);
            assert.equal("mick", item && item.userName);
            assert.notEqual("alexia", item && item.userName);
        });
    });

    describe("Zone.flush", function() {

        it("removes all items in cache", function() {

            zone.flush();

            assert.equal(0, zone.length);
            assert.equal(0, zone.findAll().length);
            assert.equal(undefined, zone.findOne("id", { id: 3 }));
            assert.equal(undefined, zone.findOne("id", { id: 123 }));
        });
    });
});
