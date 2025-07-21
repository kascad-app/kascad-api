import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from "@nestjs/common";

import { ZodError, ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(
          "Validation failed for schema:",
          this.schema.constructor.name,
        );
        console.error("Validation errors:", error.errors);
        throw new BadRequestException(
          `Validation failed: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        );
      } else {
        console.error("Unexpected error during validation:", error);
        throw new BadRequestException(
          "Validation failed due to an unexpected error",
        );
      }
    }
  }
}
