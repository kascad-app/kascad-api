import { ProfileRole } from "@kascad-app/shared-types";
import { applyDecorators, SetMetadata } from "@nestjs/common";

export const Logged = (...roles: ProfileRole[]) =>
  applyDecorators(SetMetadata("secured", true), SetMetadata("roles", roles));
