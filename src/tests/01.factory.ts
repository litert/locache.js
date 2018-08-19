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

describe("Factory", function() {

    describe("createFactory", function() {

        describe("Call once", function() {

            it("should return a factory object", function() {

                assert.equal("object", typeof LoC.createFactory());
            });
        });

        describe("Call multi-times", function() {

            it("should return different factory objects", function() {

                assert.equal(true, LoC.createFactory() !== LoC.createFactory());
            });
        });
    });

    describe("getDefaultFactory", function() {

        describe("Call once", function() {

            it("should return a factory object", function() {

                assert.equal("object", typeof LoC.getDefaultFactory());

            });
        });

        describe("Call multi-times", function() {

            it("should return the same factory object", function() {

                assert.equal(
                    true,
                    LoC.getDefaultFactory() === LoC.getDefaultFactory()
                );
            });
        });
    });

    describe("Factory.createZone", function() {

        describe("Call once", function() {

            const factory = LoC.createFactory();

            it("should return a zone object", function() {

                assert.equal("object", typeof factory.createZone<
                    IUser,
                    IUserIndexes
                >({
                    name: "users",
                    indexes: {
                        id: ["id"],
                        email: ["system", "email"],
                        userName: ["system", "userName"]
                    }
                }));
            });
        });

        describe("Call multi-times with same name", function() {

            const factory = LoC.createFactory();

            it("should throw an error", function() {

                assert.throws(function() {

                    factory.createZone<
                        IUser,
                        IUserIndexes
                    >({
                        name: "users",
                        indexes: {
                            id: ["id"],
                            email: ["system", "email"],
                            userName: ["system", "userName"]
                        }
                    });

                    factory.createZone<
                        IUser,
                        IUserIndexes
                    >({
                        name: "users",
                        indexes: {
                            id: ["id"],
                            email: ["system", "email"],
                            userName: ["system", "userName"]
                        }
                    });

                }, Error, "Local cache zone \"users\" already exist.");
            });
        });
    });

    describe("Factory.getZone", function() {

        const factory = LoC.createFactory();

        factory.createZone<
            IUser,
            IUserIndexes
        >({
            name: "users",
            indexes: {
                id: ["id"],
                email: ["system", "email"],
                userName: ["system", "userName"]
            }
        });

        describe("Get an existing zone", function() {

            it("should return a zone object", function() {

                assert.equal("object", typeof factory.getZone<
                    IUser,
                    IUserIndexes
                >("users"));
            });
        });

        describe("Get an existing zone, multi-times", function() {

            it("should return a same zone object", function() {

                assert.equal(true, factory.getZone<
                    IUser,
                    IUserIndexes
                >("users") === factory.getZone<
                    IUser,
                    IUserIndexes
                >("users"));
            });
        });

        describe("Get a non-existed zone", function() {

            it("should throw an error", function() {

                assert.throws(function() {

                    factory.getZone("friends");

                }, Error, "Local cache zone \"friends\" doesn't exist.");
            });
        });
    });
});
