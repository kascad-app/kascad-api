import { ProfileRole, Rider, Sponsor } from "@kascad-app/shared-types";
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

type User = Rider | Sponsor;

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly _reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: ProfileRole[] = this._reflector.get<ProfileRole[]>(
      "roles",
      context.getHandler(),
    );

    if (!roles || roles.length === 0) return true;

    const { user }: { user: User } = context.switchToHttp().getRequest();

    if (!user) throw new BadRequestException("Invalid request context");

    const hasRole = () => roles.includes(user.role);

    if (!hasRole()) throw new UnauthorizedException("Restricted access");

    return true;
  }
}
