import { Actor, DatabaseTransactionHandler } from 'graasp';

import { InvitationService } from '../db-service';
import Invitation from '../interfaces/invitation';
import { BaseTask } from './base-task';

export type DeleteInvitationTaskInputType = {
  id?: string;
};

class DeleteInvitationTask extends BaseTask<Actor, Invitation> {
  get name(): string {
    return DeleteInvitationTask.name;
  }

  input: DeleteInvitationTaskInputType;
  getInput: () => DeleteInvitationTaskInputType;

  constructor(actor: Actor, service: InvitationService, input?: DeleteInvitationTaskInputType) {
    super(actor, service);
    this.input = input ?? {};
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    const { id } = this.input;

    this._result = await this.invitationService.delete(id, handler);

    this.status = 'OK';
  }
}

export default DeleteInvitationTask;
