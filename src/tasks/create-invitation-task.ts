import { Actor, DatabaseTransactionHandler, MemberService } from 'graasp';
import { BaseTask } from './base-task';
import Invitation from '../interfaces/invitation';
import { InvitationService } from '../db-service';
import { BaseInvitation } from '../base-invitation';
import { UniqueIntegrityConstraintViolationError } from 'slonik';
import { DuplicateInvitationError, MemberAlreadyExistForEmailError } from '../errors';

export type CreateInvitationTaskInputType = {
  invitation?: Partial<Invitation>;
  itemId?: string;
};

class CreateInvitationTask extends BaseTask<Actor, Invitation> {
  memberService: MemberService;

  get name(): string {
    return CreateInvitationTask.name;
  }

  input: CreateInvitationTaskInputType;
  getInput: () => CreateInvitationTaskInputType;

  constructor(
    actor: Actor,
    service: InvitationService,
    memberService: MemberService,
    input?: CreateInvitationTaskInputType,
  ) {
    super(actor, service);
    this.memberService = memberService;
    this.input = input ?? {};
  }

  async run(handler: DatabaseTransactionHandler): Promise<void> {
    this.status = 'RUNNING';

    const { invitation, itemId } = this.input;

    const { permission, email, name } = invitation;

    // check no member has this email already -> a membership should be created right away
    const members = await this.memberService.getMatching({ email }, handler);
    if (members.length) {
      throw new MemberAlreadyExistForEmailError({ email });
    }

    try {
      this._result = await this.invitationService.create(
        new BaseInvitation(this.actor.id, itemId, { permission, name, email }),
        handler,
      );
    } catch (e) {
      // throw if an invitation for the pair item id and email already exists
      if (e instanceof UniqueIntegrityConstraintViolationError) {
        throw new DuplicateInvitationError({ permission, itemId, email });
      }
      throw e;
    }

    this.status = 'OK';
  }
}

export default CreateInvitationTask;
