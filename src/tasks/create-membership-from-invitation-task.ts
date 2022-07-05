import { Actor, DatabaseTransactionHandler, ItemMembership } from 'graasp';

import { InvitationService } from '../db-service';
import Invitation from '../interfaces/invitation';
import { BaseTask } from './base-task';

export type CreateMembershipFromInvitationTaskInputType = {
  invitation?: Invitation;
  memberId?: string;
};

class CreateMembershipFromInvitationTask extends BaseTask<Actor, ItemMembership> {
  get name(): string {
    return CreateMembershipFromInvitationTask.name;
  }

  input: CreateMembershipFromInvitationTaskInputType;
  getInput: () => CreateMembershipFromInvitationTaskInputType;

  constructor(
    actor: Actor,
    service: InvitationService,
    input?: CreateMembershipFromInvitationTaskInputType,
  ) {
    super(actor, service);
    this.input = input ?? {};
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    const { invitation, memberId } = this.input;

    const partialMembership = {
      itemPath: invitation.itemPath,
      memberId,
      permission: invitation.permission,
      creator: invitation.creator,
    };

    this._result = await this.invitationService.createMembership(partialMembership, handler);

    // remove invitation once membership is created
    await this.invitationService.delete(invitation.id, handler);

    this.status = 'OK';
  }
}

export default CreateMembershipFromInvitationTask;
