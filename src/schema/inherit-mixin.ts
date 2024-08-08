import { ConstructorOf } from "@utils/ConstructorOf";
import { registerExpectedSubtype } from "@schema/expected-subtypes";

export function $<TExtends extends {}>(
  supertype: ConstructorOf<TExtends>,
): ConstructorOf<Omit<TExtends, "$">> {
  if (!supertype)
    throw new Error(
      `The provided supertype was undefined. This was probably caused by circular imports: try moving the subtype into the same file`,
    );

  const subtypeAnonClass = class extends supertype {};
  registerExpectedSubtype(supertype, subtypeAnonClass);

  return subtypeAnonClass;
}
