import { StatusCodes } from 'http-status-codes';
import { v4 } from 'uuid';

import { ItemMembership, PermissionLevel } from '@graasp/sdk';

import { GraaspInvitationsError } from '../src/errors';
import Invitation from '../src/interfaces/invitation';

export const GRAASP_ACTOR = {
  name: 'graasp',
  id: 'graasp-id',
};

export const buildInvitation = ({
  email,
  permission,
  itemPath,
  name,
}: {
  email?: string;
  permission?: PermissionLevel;
  name?: string;
  itemPath: string;
}): Invitation => ({
  id: v4(),
  itemPath,
  creator: 'fake-creator',
  name: name ?? 'fake-name',
  email: email ?? 'fake-email@mail.com',
  permission: permission ?? PermissionLevel.Read,
  createdAt: Date.now().toString(),
  updatedAt: Date.now().toString(),
});

const itemId = v4();
const itemPath = 'itemPath';
export const FIXTURE_ITEM = {
  id: itemId,
  name: 'my-item',
};
export const FIXTURE_MEMBER = {
  name: 'anna',
  email: 'anna@mail.com',
  id: 'anna-id',
};
export const FIXTURE_MEMBERSHIP: ItemMembership = {
  id: 'mock-membership-id',
  memberId: 'anna',
  itemPath: 'mock-item-path',
  permission: PermissionLevel.Read,
  creator: 'mock-creator',
  createdAt: 'mock-created-at',
  updatedAt: 'mock-updated-at'
};
export const FIXTURES_INVITATIONS = [
  buildInvitation({ itemPath, ...FIXTURE_MEMBER }),
  buildInvitation({ itemPath, ...FIXTURE_MEMBER }),
  buildInvitation({ itemPath, name: 'bob' }),
  buildInvitation({ itemPath, name: 'cedric' }),
];

export class MockError extends GraaspInvitationsError {
  constructor(data?: unknown) {
    super(
      { code: 'GPINVERR001', statusCode: StatusCodes.NOT_FOUND, message: 'Item not found' },
      data,
    );
  }
}
