import { Definition } from "./index";
import { ConstructorOf } from "@utils/ConstructorOf";
import { setExpectedSubtypes } from "./subtypes-cache";
import { None, WithID } from "./presets";

export const Interface = <S extends object = None>(
  // @ts-ignore
  extend: abstract new () => S = None,
) => {
  // @ts-ignore
  const newClass = class extends extend {
    $kind = "node-interface" as const;
  };

  setExpectedSubtypes(extend, newClass, "<unnamed interface>");
  return newClass;
};

export const NodeUnion = <
  T extends Record<
    string,
    ConstructorOf<Definition<"node-interface" | "abstract-node" | "node">>
  >,
>(
  of: () => T,
) => {
  return class {
    $kind = "node-union" as const;
    $subtypes = of();
  };
};

export const AbstractNode = <N extends string, S extends object = WithID>(
  name: N,
  // @ts-ignore
  extend: abstract new () => S = WithID,
) => {
  // @ts-ignore
  const newClass = class extends extend {
    //@ts-ignore
    $kind = "abstract-node" as const;
    $name = name;
  };

  setExpectedSubtypes(extend, newClass, name);
  return newClass;
};

export const Node = <N extends string, S extends object = WithID>(
  name: N,
  // @ts-ignore
  extend: abstract new () => S = WithID,
) => {
  // @ts-ignore
  const newClass = class extends extend {
    $kind = "node" as const;
    $name = name;
  };

  setExpectedSubtypes(extend, newClass, name);
  return newClass;
};

export const Relationship = <N extends string>(name: N) => {
  return class {
    $kind = "relationship" as const;
    $name = name;
  };
};
