import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard as JwtAuthGuard } from "@nestjs/passport";

import { Observable } from "rxjs";

@Injectable()
export class AuthenticationGuard extends JwtAuthGuard("jwt") {
  constructor(private readonly _reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const optionalAuth: boolean = this._reflector.get<boolean>(
      "optionalAuth",
      context.getHandler(),
    );

    const secured: boolean = this._reflector.get<boolean>(
      "secured",
      context.getHandler(),
    );
    if (!secured && !optionalAuth) return true;

    try {
      // Tente l'authentification via JwtAuthGuard
      const result = await super.canActivate(context);
      return result as boolean;
    } catch (error) {
      // Si l'authentification est optionnelle, ne pas bloquer
      if (optionalAuth) {
        return true;
      }
      throw error;
    }
  }
}
