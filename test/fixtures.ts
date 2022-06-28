import { StatusCodes } from 'http-status-codes';
import { v4 } from 'uuid';

import { PermissionLevel } from '../src/constants';
import { GraaspInvitationError } from '../src/errors';

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
}) => ({
  id: v4(),
  itemPath,
  name: name ?? 'fake-name',
  email: email ?? 'fake-email@mail.com',
  permission: permission ?? PermissionLevel.Read,
  createdAt: Date.now(),
  updatedAt: Date.now(),
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
export const FIXTURES_INVITATIONS = [
  buildInvitation({ itemPath, ...FIXTURE_MEMBER }),
  buildInvitation({ itemPath, ...FIXTURE_MEMBER }),
  buildInvitation({ itemPath, name: 'bob' }),
  buildInvitation({ itemPath, name: 'cedric' }),
];

export class MockError extends GraaspInvitationError {
  constructor(data?: unknown) {
    super(
      { code: 'GPINVERR001', statusCode: StatusCodes.NOT_FOUND, message: 'Item not found' },
      data,
    );
  }
}
