import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AuthedRequest } from "../auth.guard";
import type { AccessClaims } from "../token.service";

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AccessClaims | undefined => {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    return req.user;
  },
);
