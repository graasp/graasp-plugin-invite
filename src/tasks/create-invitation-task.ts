import { Actor, DatabaseTransactionHandler } from 'graasp';
import { BaseTask } from './base-task';
import Invitation from '../interfaces/invitation';
import { InvitationService } from '../db-service';
import { BaseInvitation } from '../base-invitation';

export type CreateInvitationTaskInputType = {
  invitation?: Partial<Invitation>;
  itemId?: string;
};

class CreateInvitationTask extends BaseTask<Actor, Invitation> {
  get name(): string {
    return CreateInvitationTask.name;
  }

  input: CreateInvitationTaskInputType;
  getInput: () => CreateInvitationTaskInputType;

  constructor(actor: Actor, service: InvitationService, input?: CreateInvitationTaskInputType) {
    super(actor, service);
    this.input = input ?? {};
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    const { invitation, itemId } = this.input;

    const { permission, email, name } = invitation;
    this._result = await this.invitationService.create(
      new BaseInvitation(this.actor.id, itemId, { permission, name, email }),
      handler,
    );

    this.status = 'OK';
  }
}

export default CreateInvitationTask;
