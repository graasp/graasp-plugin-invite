import { Actor, DatabaseTransactionHandler } from 'graasp';
import { BaseTask } from './base-task';
import Invitation from '../interfaces/invitation';
import { InvitationService } from '../db-service';
import { BaseInvitation } from '../base-invitation';
import { UniqueIntegrityConstraintViolationError } from 'slonik';
import { DuplicateInvitationError } from '../errors';

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
    try {
      this._result = await this.invitationService.create(
        new BaseInvitation(this.actor.id, itemId, { permission, name, email }),
        handler,
      );
    } catch (e) {
      // throw if an invitation for the pair item id and email already exists
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new DuplicateInvitationError({ permission, itemId, email })
      }
      throw e;
    }

    this.status = 'OK';
  }
}

export default CreateInvitationTask;
