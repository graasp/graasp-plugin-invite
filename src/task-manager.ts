import {
  Actor,
  PermissionLevel,
  ItemMembershipTaskManager,
  ItemTaskManager,
  Task,
  MemberService,
} from 'graasp';
import { InvitationService } from './db-service';
import CreateInvitationTask, {
  CreateInvitationTaskInputType,
} from './tasks/create-invitation-task';
import CreateMembershipFromInvitationTask, {
  CreateMembershipFromInvitationTaskInputType,
} from './tasks/create-membership-from-invitation-task';
import GetInvitationTask, { GetInvitationTaskInputType } from './tasks/get-invitation-task';
import GetInvitationsForItemTask, {
  GetInvitationsForItemTaskInputType,
} from './tasks/get-invitations-for-item-task';

class InvitationTaskManager {
  invitationService: InvitationService;
  itemTaskManager: ItemTaskManager;
  itemMembershipTaskManager: ItemMembershipTaskManager;
  memberService: MemberService;

  constructor(
    invitationService: InvitationService,
    itemTaskManager: ItemTaskManager,
    itemMembershipTaskManager: ItemMembershipTaskManager,
    memberService: MemberService,
  ) {
    this.invitationService = invitationService;
    this.itemTaskManager = itemTaskManager;
    this.itemMembershipTaskManager = itemMembershipTaskManager;
    this.memberService = memberService;
  }

  getCreateInvitationTask(): string {
    return CreateInvitationTask.name;
  }

  createCreateTaskSequence(
    member: Actor,
    data: CreateInvitationTaskInputType,
  ): Task<Actor, unknown>[] {
    const t1 = this.itemTaskManager.createGetTask(member, data.itemId);
    const t2 = this.itemMembershipTaskManager.createGetMemberItemMembershipTask(member);
    t2.getInput = () => ({
      item: t1.result,
      validatePermission: PermissionLevel.Write,
    });
    const t3 = new CreateInvitationTask(member, this.invitationService, this.memberService, data);
    return [t1, t2, t3];
  }

  createGetforItemTaskSequence(
    member: Actor,
    data: GetInvitationsForItemTaskInputType,
  ): Task<Actor, unknown>[] {
    const t1 = this.itemTaskManager.createGetTask(member, data.itemId);
    const t2 = this.itemMembershipTaskManager.createGetMemberItemMembershipTask(member);
    t2.getInput = () => ({
      item: t1.result,
      validatePermission: PermissionLevel.Write,
    });
    const t3 = new GetInvitationsForItemTask(member, this.invitationService, data);
    return [t1, t2, t3];
  }

  createGetTask(member: Actor, data: GetInvitationTaskInputType): Task<Actor, unknown> {
    return new GetInvitationTask(member, this.invitationService, data);
  }

  createCreateMembershipFromInvitationTaskSequence(
    member: Actor,
    data: CreateMembershipFromInvitationTaskInputType,
  ): Task<Actor, unknown>[] {
    const t1 = this.itemTaskManager.createGetTask(member, data.invitation.itemId);
    const t2 = new CreateMembershipFromInvitationTask(member, this.invitationService);
    t2.getInput = () => ({
      ...data,
      item: t1.result,
    });
    return [t1, t2];
  }
}
export default InvitationTaskManager;
