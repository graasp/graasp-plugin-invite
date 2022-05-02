import { Actor, DatabaseTransactionHandler } from 'graasp';
import { BaseTask } from './base-task';
import Invitation from '../interfaces/invitation';
import { InvitationService } from '../db-service';

export type GetInvitationsForItemTaskInputType = {
  itemId?: string;
};

class GetInvitationsForItemTask extends BaseTask<Actor, readonly Invitation[]> {
  get name(): string {
    return GetInvitationsForItemTask.name;
  }

  input: GetInvitationsForItemTaskInputType;
  getInput: () => GetInvitationsForItemTaskInputType;

  constructor(
    actor: Actor,
    service: InvitationService,
    input?: GetInvitationsForItemTaskInputType,
  ) {
    super(actor, service);
    this.input = input ?? {};
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    this._result = await this.invitationService.getForItem(this.input.itemId, handler);

    this.status = 'OK';
  }
}

export default GetInvitationsForItemTask;
