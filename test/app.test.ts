import { StatusCodes } from 'http-status-codes';

import { MemberTaskManager, PermissionLevel } from '@graasp/sdk';
import { ItemMembershipTaskManager, ItemTaskManager, TaskRunner as Runner } from 'graasp-test';

import build from './app';
import { FIXTURES_INVITATIONS, FIXTURE_ITEM, MockError } from './fixtures';
import {
  mockCreateDeleteInvitationTaskSequence,
  mockCreateTaskSequence,
  mockCreateUpdateInvitationTaskSequence,
  mockGetTask,
  mockGetforItemTaskSequence,
} from './mocks';

const runner = new Runner();
const itemMembershipTaskManager = new ItemMembershipTaskManager();
const memberTaskManager = {
  getCreateTaskName: jest.fn(),
} as unknown as MemberTaskManager;
const itemTaskManager = new ItemTaskManager();
const item = FIXTURE_ITEM;

describe('Invitation Plugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(jest.fn());
  });

  describe('POST /invite', () => {
    it('create invitations successfully', async () => {
      mockCreateTaskSequence(runner, item, FIXTURES_INVITATIONS);

      const mockSendMail = jest.fn().mockImplementation(async () => {
        // do nothing
      });
      const buildInvitationLink = jest.fn().mockReturnValue('link');
      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
        sendInvitationEmail: mockSendMail,
        buildInvitationLink,
      });
      const response = await app.inject({
        method: 'POST',
        url: `/${item.id}/invite`,
        payload: { invitations: FIXTURES_INVITATIONS },
      });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(await response.json()).toEqual(FIXTURES_INVITATIONS);

      // check email got sent
      setTimeout(() => {
        expect(mockSendMail).toHaveBeenCalledTimes(FIXTURES_INVITATIONS.length);
      }, 2000);
    });

    it('throw if id is invalid', async () => {
      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
      });
      const response = await app.inject({
        method: 'POST',
        url: '/invalid-id/invite',
        payload: { invitations: FIXTURES_INVITATIONS },
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('Return errors correctly', async () => {
      const resultWithError = [...FIXTURES_INVITATIONS, new MockError()];
      mockCreateTaskSequence(runner, item, resultWithError);

      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
      });
      const response = await app.inject({
        method: 'POST',
        url: `/${item.id}/invite`,
        payload: { invitations: FIXTURES_INVITATIONS },
      });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(await response.json()).toEqual(resultWithError);
    });
  });

  describe('GET /:id/invitations', () => {
    it('get invitations for item successfully', async () => {
      const invitations = FIXTURES_INVITATIONS;
      mockGetforItemTaskSequence(runner, invitations);

      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
      });
      const response = await app.inject({
        method: 'GET',
        url: `/${item.id}/invitations`,
        payload: { invitations },
      });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(await response.json()).toEqual(invitations);
    });

    it('throw if id is invalid', async () => {
      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
      });
      const response = await app.inject({
        method: 'GET',
        url: '/invalid-id/invitations',
        payload: { invitations: FIXTURES_INVITATIONS },
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('GET /invitations/:id', () => {
    it('get invitation by id successfully', async () => {
      const invitation = FIXTURES_INVITATIONS[0];
      mockGetTask(runner, invitation);

      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
      });
      const response = await app.inject({
        method: 'GET',
        url: `/invitations/${invitation.id}`,
      });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(await response.json()).toEqual(invitation);
    });

    it('throw if id is invalid', async () => {
      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
      });
      const response = await app.inject({
        method: 'GET',
        url: '/invitations/invalid-id',
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('PATCH /:itemId/invitations/:id', () => {
    const invitation = FIXTURES_INVITATIONS[0];
    it('update invitation successfully', async () => {
      mockCreateUpdateInvitationTaskSequence(runner, invitation);

      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
      });
      const response = await app.inject({
        method: 'PATCH',
        url: `${item.id}/invitations/${invitation.id}`,
        payload: {
          permission: PermissionLevel.Admin,
          name: 'myname',
        },
      });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(await response.json()).toEqual(invitation);
    });

    it('throw if item id is invalid', async () => {
      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
      });
      const response = await app.inject({
        method: 'PATCH',
        url: `invalid/invitations/${invitation.id}`,
        payload: {
          permission: PermissionLevel.Admin,
          name: 'myname',
        },
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('throw if invitation id is invalid', async () => {
      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
      });
      const response = await app.inject({
        method: 'PATCH',
        url: `${item.id}/invitations/invalid-id`,
        payload: {
          permission: PermissionLevel.Admin,
          name: 'myname',
        },
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('throw if payload is empty', async () => {
      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
      });
      const response = await app.inject({
        method: 'PATCH',
        url: `${item.id}/invitations/${invitation.id}`,
        payload: {},
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('DELETE /:itemId/invitations/:id', () => {
    const invitation = FIXTURES_INVITATIONS[0];
    it('delete invitation successfully', async () => {
      mockCreateDeleteInvitationTaskSequence(runner, invitation);

      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
      });
      const response = await app.inject({
        method: 'DELETE',
        url: `${item.id}/invitations/${invitation.id}`,
      });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(await response.json()).toEqual(invitation);
    });

    it('throw if item id is invalid', async () => {
      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
      });
      const response = await app.inject({
        method: 'DELETE',
        url: `invalid/invitations/${invitation.id}`,
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('throw if invitation id is invalid', async () => {
      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
      });
      const response = await app.inject({
        method: 'DELETE',
        url: `${item.id}/invitations/invalid-id`,
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('POST /:itemId/invitations/:id/send', () => {
    const invitation = FIXTURES_INVITATIONS[0];
    it('send invitation successfully', async () => {
      mockCreateDeleteInvitationTaskSequence(runner, invitation);

      const buildInvitationLink = jest.fn().mockReturnValue('link');
      const mockSendMail = jest.fn().mockImplementation(async () => {
        const app = await build({
          runner,
          itemTaskManager,
          memberTaskManager,
          itemMembershipTaskManager,
          sendInvitationEmail: mockSendMail,
          buildInvitationLink,
        });
        const response = await app.inject({
          method: 'POST',
          url: `${item.id}/invitations/${invitation.id}/send`,
        });

        expect(response.statusCode).toEqual(StatusCodes.NO_CONTENT);
        // check email got sent
        setTimeout(() => {
          expect(mockSendMail).toHaveBeenCalled();
        }, 1000);
      });
    });

    it('throw if item id is invalid', async () => {
      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
      });
      const response = await app.inject({
        method: 'POST',
        url: `invalid/invitations/${invitation.id}/send`,
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('throw if invitation id is invalid', async () => {
      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
      });
      const response = await app.inject({
        method: 'POST',
        url: `${item.id}/invitations/invalid-id/send`,
      });

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });
});
