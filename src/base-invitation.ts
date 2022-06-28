import { PermissionLevel } from 'graasp';

import Invitation from './interfaces/invitation';

export class BaseInvitation implements Partial<Invitation> {
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
