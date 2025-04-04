import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class RefreshAuthGuard extends AuthGuard("jwt-refresh") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRequest(ctx: ExecutionContext): any {
    const req = ctx.switchToHttp().getRequest();
    return req;
  }
}
