import { PermissionLevel } from '@graasp/sdk';

interface Invitation {
  id: string;
  creator: string;
  name: string;
  permission: PermissionLevel;
  email: string;
  itemPath: string;
  createdAt: string;
  updatedAt: string;
}

export default Invitation;
