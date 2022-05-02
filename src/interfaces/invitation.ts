import { PermissionLevel } from 'graasp';

interface Invitation {
  id: string;
  creator: string;
  name: string;
  permission: PermissionLevel;
  email: string;
  itemId: string;
  createdAt: string;
}

export default Invitation;
