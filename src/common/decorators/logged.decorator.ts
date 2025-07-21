import { applyDecorators, SetMetadata } from "@nestjs/common";

import { ProfileRole } from "@kascad-app/shared-types";

export const Logged = (...roles: ProfileRole[]) =>
  applyDecorators(SetMetadata("secured", true), SetMetadata("roles", roles));

export const OptionalLogged = (...roles: ProfileRole[]) =>
  applyDecorators(
    SetMetadata("optionalAuth", true),
    SetMetadata("roles", roles),
  );
