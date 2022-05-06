import { PermissionLevel } from 'graasp';

export class BaseInvitation {
  creator: string;
  name: string;
  permission: PermissionLevel;
  email: string;
  itemPath: string;

  constructor(
    creator: string,
    itemPath: string,
    {
      name,
      permission,
      email,
    }: {
      name?: string;
      permission: PermissionLevel;
      email: string;
    },
  ) {
    this.creator = creator;
    this.name = name ?? null;
    this.permission = permission;
    this.email = email;
    this.itemPath = itemPath;
  }
}
