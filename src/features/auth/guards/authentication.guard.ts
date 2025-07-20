import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard as JwtAuthGuard } from "@nestjs/passport";

import { Observable } from "rxjs";

@Injectable()
export class AuthenticationGuard extends JwtAuthGuard("jwt") {
  constructor(private readonly _reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Vérifie les métadonnées au niveau de la méthode ET de la classe
    const methodSecured: boolean = this._reflector.get<boolean>(
      "secured",
      context.getHandler(),
    );
    const classSecured: boolean = this._reflector.get<boolean>(
      "secured",
      context.getClass(),
    );
    
    const secured = methodSecured || classSecured;
    
    if (!secured) {
      return true;
    }

    return super.canActivate(context);
  }
}
