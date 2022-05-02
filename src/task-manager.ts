import { Actor, PermissionLevel, ItemMembershipTaskManager, ItemTaskManager, Task } from 'graasp';
import { InvitationService } from './db-service';
import CreateInvitationsTask, {
  CreateInvitationsTaskInputType,
} from './tasks/create-invitation-task';
import CreateMembershipFromInvitationTask, {
  CreateMembershipFromInvitationTaskInputType,
} from './tasks/create-membership-from-invitation-task';
import GetInvitationsForItemTask, {
  GetInvitationsForItemTaskInputType,
} from './tasks/get-invitations-for-item-task';

class InvitationTaskManager {
  invitationService: InvitationService;
  itemTaskManager: ItemTaskManager;
  itemMembershipTaskManager: ItemMembershipTaskManager;

  constructor(
    invitationService: InvitationService,
    itemTaskManager: ItemTaskManager,
    itemMembershipTaskManager: ItemMembershipTaskManager,
  ) {
    this.invitationService = invitationService;
    this.itemTaskManager = itemTaskManager;
    this.itemMembershipTaskManager = itemMembershipTaskManager;
  }

  getCreateInvitationsTask(): string {
    return CreateInvitationsTask.name;
  }

  createCreateTaskSequence(
    member: Actor,
    data: CreateInvitationsTaskInputType,
  ): Task<Actor, unknown>[] {
    const t1 = this.itemTaskManager.createGetTask(member, data.itemId);

    const t2 = this.itemMembershipTaskManager.createGetMemberItemMembershipTask(member);
    t2.getInput = () => ({
      item: t1.result,
      validatePermission: PermissionLevel.Write,
    });
    const t3 = new CreateInvitationsTask(member, this.invitationService, data);
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
