import { v4 } from 'uuid';
import { PermissionLevel } from 'graasp';

export const GRAASP_ACTOR = {
  name: 'graasp',
  id: 'graasp-id',
};

export const buildInvitation = ({
  email,
  permission,
  itemId,
  name,
}: {
  email?: string;
  permission?: PermissionLevel;
  name?: string;
  itemId: string;
}) => ({
  itemId,
  name: name ?? 'fake-name',
  email: email ?? 'fake-email@mail.com',
  permission: permission ?? PermissionLevel.Read,
});

const itemId = v4();
const itemId2 = v4();
export const FIXTURE_ITEM = {
  id: itemId,
  name: 'my-item',
};
export const FIXTURE_MEMBER = {
  name: 'anna',
  email: 'anna@mail.com',
  id: 'anna-id',
};
export const FIXTURES_INVITATIONS = [
  buildInvitation({ itemId, ...FIXTURE_MEMBER }),
  buildInvitation({ itemId: itemId2, ...FIXTURE_MEMBER }),
  buildInvitation({ itemId, name: 'bob' }),
  buildInvitation({ itemId, name: 'cedric' }),
];
