import { Actor, DatabaseTransactionHandler, Item, ItemMembership } from 'graasp';
import { BaseTask } from './base-task';
import Invitation from '../interfaces/invitation';
import { InvitationService } from '../db-service';

export type CreateMembershipFromInvitationTaskInputType = {
  invitation?: Invitation;
  memberId?: string;
  item?: Item;
};

class CreateMembershipFromInvitationTask extends BaseTask<Actor, ItemMembership> {
  // itemService: ItemService

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

    const { invitation, item, memberId } = this.input;

    const partialMembership = {
      itemPath: item.path,
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
