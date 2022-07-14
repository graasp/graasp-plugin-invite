import { UniqueIntegrityConstraintViolationError } from 'slonik';

import { DatabaseTransactionHandler, Item, MemberService, PermissionLevel } from '@graasp/sdk';

import { GRAASP_ACTOR } from '../../test/fixtures';
import { InvitationService } from '../db-service';
import { DuplicateInvitationError, MemberAlreadyExistForEmailError } from '../errors';
import CreateInvitationTask from './create-invitation-task';

const actor = GRAASP_ACTOR;
const invitationService = {} as unknown as InvitationService;
const memberService = {
  getMatching: jest.fn(),
} as unknown as MemberService;
const item = { path: 'mockpath' } as unknown as Item;
const handler = { query: jest.fn() } as unknown as DatabaseTransactionHandler;

describe('Create Invitation Task', () => {
  it('Save lowercase email', async () => {
    memberService.getMatching = jest.fn().mockResolvedValue([]);
    invitationService.create = jest.fn();

    const invitation = {
      email: 'MyEmailWithCapital@email.org',
      name: 'myInvitation',
      permission: PermissionLevel.Admin,
    };

    const task = new CreateInvitationTask(actor, invitationService, memberService, {
      invitation,
      item,
    });
    await task.run(handler);
    expect(invitationService.create).toHaveBeenCalledWith(
      {
        email: invitation.email.toLowerCase(),
        itemPath: item.path,
        creator: actor.id,
        name: invitation.name,
        permission: invitation.permission,
      },
      handler,
    );
  });

  it('Throw if email matches a registered member', async () => {
    memberService.getMatching = jest.fn().mockResolvedValue([actor]);

    const invitation = {
      email: 'graasp@email.org',
      name: 'myInvitation',
      permission: PermissionLevel.Admin,
    };

    const task = new CreateInvitationTask(actor, invitationService, memberService, {
      invitation,
      item,
    });

    try {
      await task.run(handler);
    } catch (e) {
      expect(e).toBeInstanceOf(MemberAlreadyExistForEmailError);
    }
  });

  it('Throw on duplicate invitation', async () => {
    memberService.getMatching = jest.fn().mockResolvedValue([]);
    invitationService.create = jest
      .fn()
      .mockRejectedValue(new UniqueIntegrityConstraintViolationError(new Error(), 'constraint'));

    const invitation = {
      email: 'graasp@email.org',
      name: 'myInvitation',
      permission: PermissionLevel.Admin,
    };

    const task = new CreateInvitationTask(actor, invitationService, memberService, {
      invitation,
      item,
    });
    try {
      await task.run(handler);
    } catch (e) {
      expect(e).toBeInstanceOf(DuplicateInvitationError);
      expect(invitationService.create).toHaveBeenCalled();
    }
  });
});
