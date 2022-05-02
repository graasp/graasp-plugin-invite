import { FastifyLoggerInstance } from 'fastify';
import { DatabaseTransactionHandler, MemberTaskManager } from 'graasp';
import { ItemMembershipTaskManager, ItemTaskManager } from 'graasp-test';
import Runner from 'graasp-test/src/tasks/taskRunner';
import build from './app';
import { FIXTURES_INVITATIONS, FIXTURE_MEMBER, GRAASP_ACTOR } from './fixtures';
import {
  mockCreateMembershipFromInvitationTaskSequence,
  mockGetForMember,
  mockRunMultipleSequences,
} from './mocks';

const runner = new Runner();
const itemMembershipTaskManager = new ItemMembershipTaskManager();
const memberTaskManager = {
  getCreateTaskName: jest.fn(),
} as unknown as MemberTaskManager;
const itemTaskManager = new ItemTaskManager();
const handler = {} as unknown as DatabaseTransactionHandler;
const log = {} as unknown as FastifyLoggerInstance;

export const buildAppOptions = () => ({
  runner,
  itemMembershipTaskManager,
  itemTaskManager,
  memberTaskManager,
});

const actor = GRAASP_ACTOR;
const invitations = FIXTURES_INVITATIONS;

describe('Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Member create posthook', () => {
    beforeEach(() => {
      mockRunMultipleSequences(runner, true);
    });

    it('create invitations successfully', async () => {
      const member = FIXTURE_MEMBER;
      const filteredInvitations = invitations.filter(
        (invitation) => invitation.email === member.email,
      );
      const mock = mockCreateMembershipFromInvitationTaskSequence(invitations);
      mockGetForMember(filteredInvitations);

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === memberTaskManager.getCreateTaskName()) {
          await fn(member, actor, { handler, log });
          expect(mock).toHaveBeenCalledTimes(filteredInvitations.length);
        }
      });

      await build(buildAppOptions());
    });

    it('Does not run if no invitation found', async () => {
      const member = { email: 'no-invitation@mail.com' };
      const filteredInvitations = invitations.filter(
        (invitation) => invitation.email === member.email,
      );
      const mock = mockCreateMembershipFromInvitationTaskSequence(invitations);
      mockGetForMember(filteredInvitations);

      jest.spyOn(runner, 'setTaskPostHookHandler').mockImplementation(async (name, fn) => {
        if (name === memberTaskManager.getCreateTaskName()) {
          await fn(member, actor, { handler, log });
          expect(mock).toHaveBeenCalledTimes(filteredInvitations.length);
        }
      });

      await build(buildAppOptions());
    });
  });
});
