import { MemberTaskManager } from 'graasp';
import { ItemMembershipTaskManager, ItemTaskManager } from 'graasp-test';
import Runner from 'graasp-test/src/tasks/taskRunner';
import { BaseGraaspError } from 'graasp/util/graasp-error';
import { StatusCodes } from 'http-status-codes';
import build from './app';
import { FIXTURES_INVITATIONS, FIXTURE_ITEM, MockError } from './fixtures';
import { mockCreateTaskSequence, mockGetforItemTaskSequence } from './mocks';

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

  describe('/invite', () => {
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
        url: `/${FIXTURES_INVITATIONS[0].itemId}/invite`,
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
      const resultWithError = [...FIXTURES_INVITATIONS, new MockError()]
      mockCreateTaskSequence(runner, item, resultWithError);

      console.log(`/${FIXTURES_INVITATIONS[0].itemId}/invite`)
      const app = await build({
        runner,
        itemTaskManager,
        memberTaskManager,
        itemMembershipTaskManager,
      });
      const response = await app.inject({
        method: 'POST',
        url: `/${FIXTURES_INVITATIONS[0].itemId}/invite`,
        payload: { invitations: FIXTURES_INVITATIONS },
      });

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(await response.json()).toEqual(resultWithError);
    });
  });

  describe('/:id/invitations', () => {
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
        url: `/${invitations[0].itemId}/invitations`,
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
});
