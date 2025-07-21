import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard as JwtAuthGuard } from "@nestjs/passport";

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

    const methodSecured: boolean = this._reflector.get<boolean>(
      "secured",
      context.getHandler(),
    );
    const classSecured: boolean = this._reflector.get<boolean>(
      "secured",
      context.getClass(),
    );

    const secured = methodSecured || classSecured;


    if (!secured && !optionalAuth) return true;

    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch (error) {
      if (optionalAuth) {
        return true;
      }
      throw error;
    }
  }
}
