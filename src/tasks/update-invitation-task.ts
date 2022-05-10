import { Actor, DatabaseTransactionHandler } from 'graasp';
import { BaseTask } from './base-task';
import Invitation from '../interfaces/invitation';
import { InvitationService } from '../db-service';

export type UpdateInvitationTaskInputType = {
  id?: string;
  invitation?: Partial<Invitation>;
};

// TODO: it would be better to correctly check the permissions as done when we update membership
// ex: cannot add a lower permission below, remove unnecessary permissions
// currently it is resolved automatically when creating the memberships
// how to prettily refactor and reuse the logic of membership?

class UpdateInvitationTask extends BaseTask<Actor, Invitation> {
  get name(): string {
    return UpdateInvitationTask.name;
  }

  input: UpdateInvitationTaskInputType;
  getInput: () => UpdateInvitationTaskInputType;

  constructor(actor: Actor, service: InvitationService, input?: UpdateInvitationTaskInputType) {
    super(actor, service);
    this.input = input ?? {};
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    const { invitation, id } = this.input;

    this._result = await this.invitationService.update(id, invitation, handler);

    this.status = 'OK';
  }
}

export default UpdateInvitationTask;
