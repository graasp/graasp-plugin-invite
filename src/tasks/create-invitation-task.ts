import { Actor, DatabaseTransactionHandler } from 'graasp';
import { BaseTask } from './base-task';
import Invitation from '../interfaces/invitation';
import { InvitationService } from '../db-service';

export type CreateInvitationsTaskInputType = {
  invitations?: Partial<Invitation>[];
  itemId?: string;
};

class CreateInvitationsTask extends BaseTask<Actor, Invitation[]> {
  get name(): string {
    return CreateInvitationsTask.name;
  }

  input: CreateInvitationsTaskInputType;
  getInput: () => CreateInvitationsTaskInputType;

  constructor(actor: Actor, service: InvitationService, input?: CreateInvitationsTaskInputType) {
    super(actor, service);
    this.input = input ?? {};
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    this._result = await Promise.all(
      this.input.invitations?.map((inv) => {
        return this.invitationService.create(inv, handler);
      }),
    );

    this.status = 'OK';
  }
}

export default CreateInvitationsTask;
