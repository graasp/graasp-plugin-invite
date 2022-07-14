import { Actor, DatabaseTransactionHandler, TaskStatus } from '@graasp/sdk';

import { InvitationService } from '../db-service';
import Invitation from '../interfaces/invitation';
import { BaseTask } from './base-task';

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
    this.status = TaskStatus.RUNNING;

    this._result = await this.invitationService.get(this.input.id, handler);

    this.status = TaskStatus.OK;
  }
}

export default GetInvitationTask;
