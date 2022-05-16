import { Actor, DatabaseTransactionHandler } from 'graasp';
import { BaseTask } from './base-task';
import Invitation from '../interfaces/invitation';
import { InvitationService } from '../db-service';

export type GetInvitationTaskInputType = {
  id?: string;
};

class GetInvitationTask extends BaseTask<Actor, Invitation> {
  get name(): string {
    return GetInvitationTask.name;
  }

  input: GetInvitationTaskInputType;
  getInput: () => GetInvitationTaskInputType;

  constructor(actor: Actor, service: InvitationService, input?: GetInvitationTaskInputType) {
    super(actor, service);
    this.input = input ?? {};
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    this._result = await this.invitationService.get(this.input.id, handler);

    this.status = 'OK';
  }
}

export default GetInvitationTask;
