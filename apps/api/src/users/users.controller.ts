import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { UsersService } from "./users.service";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { IsIn } from "class-validator";

class SetRoleDto {
  @IsIn(["SUPER_ADMIN", "OPERATIONS_ADMIN", "FINANCE_ADMIN", "TEAM_LEAD", "MEMBER"])
  role!: "SUPER_ADMIN" | "OPERATIONS_ADMIN" | "FINANCE_ADMIN" | "TEAM_LEAD" | "MEMBER";
}

@Controller("admin/users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @RequirePermissions("admin:users:manage")
  list() {
    return this.users.list().then((items) => ({ items }));
  }

  @Patch(":id/role")
  @RequirePermissions("admin:users:manage")
  setRole(@Param("id") id: string, @Body() dto: SetRoleDto) {
    return this.users.setRole(id, dto.role).then((user) => ({ user }));
  }

  @Post(":id/suspend")
  @RequirePermissions("admin:users:manage")
  suspend(@Param("id") id: string) {
    return this.users.suspend(id).then((user) => ({ user }));
  }

  @Post(":id/reactivate")
  @RequirePermissions("admin:users:manage")
  reactivate(@Param("id") id: string) {
    return this.users.reactivate(id).then((user) => ({ user }));
  }
}
