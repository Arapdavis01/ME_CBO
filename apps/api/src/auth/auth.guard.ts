import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { TokenService, type AccessClaims } from "./token.service";
import { ACCESS_COOKIE, AUTH_ERRORS } from "./auth.constants";
import { IS_PUBLIC_KEY } from "./decorators/public.decorator";

export type AuthedRequest = Request & { user?: AccessClaims };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const raw = req.cookies?.[ACCESS_COOKIE] as string | undefined;
    if (!raw) throw new UnauthorizedException(AUTH_ERRORS.TOKEN_INVALID);

    try {
      const claims = await this.tokens.verifyAccess(raw);
      req.user = claims;
      return true;
    } catch {
      throw new UnauthorizedException(AUTH_ERRORS.TOKEN_INVALID);
    }
  }
}
