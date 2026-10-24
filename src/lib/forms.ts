"use client";

import {
  useForm,
  type FieldErrors,
  type Resolver,
  type FieldValues,
  type UseFormProps,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

/**
 * react-hook-form wired to a zod schema. One schema gives you client-side
 * validation here and can be reused unchanged on the server (server actions).
 *
 *   const form = useZodForm(contactSchema);
 *   <Input label="Name" error={form.formState.errors.name?.message} {...form.register("name")} />
 */
export function useZodForm<S extends z.ZodType<FieldValues, FieldValues>>(
  schema: S,
  options?: Omit<UseFormProps<z.input<S>, unknown, z.output<S>>, "resolver">,
) {
  return useForm<z.input<S>, unknown, z.output<S>>({
    mode: "onTouched",
    ...options,
    // zodResolver's generics can't express input/output of a generic schema; the cast is safe
    // because the resolver is built from the same schema that defines both types.
    resolver: zodResolver(schema) as unknown as Resolver<
      z.input<S>,
      unknown,
      z.output<S>
    >,
  });
}

/** Read an error message for a field name from react-hook-form's errors object. */
export function errorMessage<T extends FieldValues>(
  errors: FieldErrors<T>,
  name: keyof T & string,
) {
  const e = errors[name];
  return typeof e?.message === "string" ? e.message : undefined;
}
