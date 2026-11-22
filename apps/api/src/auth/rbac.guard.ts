import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  ANY_PERMISSIONS_KEY,
  PERMISSIONS_KEY,
} from "./decorators/permissions.decorator";
import type { Permission } from "./permissions";
import { permissionsFor } from "./permissions";
import type { AuthedRequest } from "./auth.guard";

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const targets = [ctx.getHandler(), ctx.getClass()];
    const all = this.reflector.getAllAndOverride<Permission[] | undefined>(
      PERMISSIONS_KEY,
      targets,
    );
    const any = this.reflector.getAllAndOverride<Permission[] | undefined>(
      ANY_PERMISSIONS_KEY,
      targets,
    );

    const needsAll = !!all && all.length > 0;
    const needsAny = !!any && any.length > 0;
    if (!needsAll && !needsAny) return true;

    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const held = permissionsFor(req.user?.role);

    if (needsAll && !all!.every((p) => held.includes(p))) {
      throw new ForbiddenException("Insufficient permissions");
    }
    if (needsAny && !any!.some((p) => held.includes(p))) {
      throw new ForbiddenException("Insufficient permissions");
    }
    return true;
  }
}
