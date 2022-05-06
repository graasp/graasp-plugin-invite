import {
  Actor,
  PermissionLevel,
  ItemMembershipTaskManager,
  ItemTaskManager,
  Task,
  MemberService,
} from 'graasp';
import { InvitationService } from './db-service';
import Invitation from './interfaces/invitation';
import CreateInvitationTask from './tasks/create-invitation-task';
import CreateMembershipFromInvitationTask, {
  CreateMembershipFromInvitationTaskInputType,
} from './tasks/create-membership-from-invitation-task';
import DeleteInvitationTask from './tasks/delete-invitation-task';
import GetInvitationTask, { GetInvitationTaskInputType } from './tasks/get-invitation-task';
import GetInvitationsForItemTask from './tasks/get-invitations-for-item-task';
import UpdateInvitationTask from './tasks/update-invitation-task';

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
    data: { itemId: string; invitation: Partial<Invitation> },
  ): Task<Actor, unknown>[] {
    const t1 = this.itemTaskManager.createGetTask(member, data.itemId);
    const t2 = this.itemMembershipTaskManager.createGetMemberItemMembershipTask(member);
    t2.getInput = () => ({
      item: t1.result,
      validatePermission: PermissionLevel.Write,
    });
    const t3 = new CreateInvitationTask(member, this.invitationService, this.memberService);
    t2.getInput = () => ({
      ...data,
      item: t1.result,
    });
    return [t1, t2, t3];
  }

  createGetforItemTaskSequence(member: Actor, data: { itemId: string }): Task<Actor, unknown>[] {
    const t1 = this.itemTaskManager.createGetTask(member, data.itemId);
    const t2 = this.itemMembershipTaskManager.createGetMemberItemMembershipTask(member);
    t2.getInput = () => ({
      item: t1.result,
      validatePermission: PermissionLevel.Write,
    });
    const t3 = new GetInvitationsForItemTask(member, this.invitationService);
    t2.getInput = () => ({
      ...data,
      item: t1.result,
    });
    return [t1, t2, t3];
  }

  createGetTask(member: Actor, data: GetInvitationTaskInputType): Task<Actor, unknown> {
    return new GetInvitationTask(member, this.invitationService, data);
  }

  createCreateMembershipFromInvitationTask(
    member: Actor,
    data: CreateMembershipFromInvitationTaskInputType,
  ): Task<Actor, unknown> {
    return new CreateMembershipFromInvitationTask(member, this.invitationService, data);
  }

  createUpdateInvitationTaskSequence(
    member: Actor,
    data: { itemId: string; invitationId: string; body: Partial<Invitation> },
  ): Task<Actor, unknown>[] {
    const t1 = this.itemTaskManager.createGetTask(member, data.itemId);
    const t2 = this.itemMembershipTaskManager.createGetMemberItemMembershipTask(member);
    t2.getInput = () => ({
      item: t1.result,
      validatePermission: PermissionLevel.Write,
    });
    const t3 = new UpdateInvitationTask(member, this.invitationService, {
      id: data.invitationId,
      invitation: data.body,
    });
    return [t1, t2, t3];
  }

  createDeleteInvitationTaskSequence(
    member: Actor,
    data: { itemId: string; invitationId: string },
  ): Task<Actor, unknown>[] {
    const t1 = this.itemTaskManager.createGetTask(member, data.itemId);
    const t2 = this.itemMembershipTaskManager.createGetMemberItemMembershipTask(member);
    t2.getInput = () => ({
      item: t1.result,
      validatePermission: PermissionLevel.Write,
    });
    const t3 = new DeleteInvitationTask(member, this.invitationService, { id: data.invitationId });
    return [t1, t2, t3];
  }
}
export default InvitationTaskManager;
