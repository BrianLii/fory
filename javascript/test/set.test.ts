/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import Fory, { Type } from "../packages/core/index";
import { BinaryReader } from "../packages/core/lib/reader";
import { ConfigFlags, RefFlags, TypeId } from "../packages/core/lib/type";
import { describe, expect, test } from "@jest/globals";

describe("set", () => {
  test("writes registered typed roots with inline element type info", () => {
    const writer = new Fory({ compatible: false, ref: false });
    const registration = writer.register(Type.set(Type.int32({ encoding: "fixed" })));
    const value = new Set([1, 2, 3]);
    const bytes = registration.serialize(value);
    const reader = new BinaryReader({});
    reader.reset(bytes);
    expect(reader.readUint8()).toBe(ConfigFlags.isCrossLanguageFlag);
    expect(reader.readInt8()).toBe(RefFlags.NotNullValueFlag);
    expect(reader.readUint8()).toBe(TypeId.SET);
    expect(reader.readVarUint32Small7()).toBe(value.size);
    expect(reader.readUint8() & 0b1100).toBe(0b1000);
    expect(reader.readUint8()).toBe(TypeId.INT32);

    expect(new Fory({ compatible: false, ref: false }).deserialize(bytes)).toEqual(value);
    expect(registration.deserialize(writer.serialize(value))).toEqual(value);
  });

  test("should set work", () => {
    const fory = new Fory({ compatible: false, ref: true });
    const input = fory.serialize(new Set(["foo1", "bar1", "cc2"]));
    const result = fory.deserialize(input);
    expect(result).toEqual(new Set(["foo1", "bar1", "cc2"]));
  });
  test("should set in object work", () => {
    const typeinfo = Type.struct(
      {
        typeName: "example.foo",
      },
      {
        a: Type.set(Type.string()),
      },
    );

    const fory = new Fory({ compatible: false, ref: true });
    const { serialize, deserialize } = fory.register(typeinfo);
    const input = serialize({ a: new Set(["foo1", "bar2"]) });
    const result = deserialize(input);
    expect(result).toEqual({ a: new Set(["foo1", "bar2"]) });
  });
});
