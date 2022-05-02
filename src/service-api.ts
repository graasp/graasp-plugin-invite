import { FastifyPluginAsync } from 'fastify';
import { IdParam, Item, Member } from 'graasp';
import mailerPlugin from 'graasp-mailer';
import definitions, { getForItem, invite } from './schema';
import InvitationTaskManager from './task-manager';
import { InvitationService } from './db-service';
import Invitation from './interfaces/invitation';
import { BuildInvitationLinkFunction } from './types';

export interface GraaspPluginInvitationsOptions {
  buildInvitationLink: BuildInvitationLinkFunction;
}

const basePlugin: FastifyPluginAsync<GraaspPluginInvitationsOptions> = async (fastify, options) => {
  const { buildInvitationLink } = options;
  const {
    taskRunner: runner,
    items: { taskManager: iTM },
    itemMemberships: { taskManager: iMTM },
    members: { taskManager: mTM },
    mailer,
  } = fastify;

  if (!mailerPlugin) {
    throw new Error('Mailer plugin is not defined');
  }

  const dbService = new InvitationService();
  const taskManager = new InvitationTaskManager(dbService, iTM, iMTM);

  fastify.addSchema(definitions);

  // on member creation, invitations become memberships
  const createCreateTaskName = mTM.getCreateTaskName();
  runner.setTaskPostHookHandler(
    createCreateTaskName,
    async (member: Member, actor, { handler }) => {
      // replace invitations to memberships
      const invitations = await dbService.getForMember(member.id, handler);
      if (invitations.length) {
        const sequences = invitations.map((invitation) =>
          taskManager.createCreateMembershipFromInvitationTaskSequence(member, {
            invitation,
            memberId: member.id,
          }),
        );
        // don't need to wait
        runner.runMultipleSequences(sequences);
      }
    },
  );

  fastify.post<{ Params: IdParam; Body: { invitations: Partial<Invitation>[] } }>(
    '/invite/:id',
    {
      schema: invite,
    },
    async ({ member, body, params, log }) => {
      const { id: itemId } = params;
      const { invitations } = body;
      const tasks = taskManager.createCreateTaskSequence(member, { itemId, invitations });
      const completeInvitations = (await runner.runSingleSequence(tasks)) as Invitation[];

      const item = tasks[0].result as Item;

      log.debug('send invitation mails');
      completeInvitations.forEach((invitation) => {
        // send mail without awaiting
        const invitationLink = buildInvitationLink(invitation);
        const lang = member?.extra?.lang as string;
        mailer
          .sendInvitationEmail(member, invitationLink, item.name, member.name, lang)
          .catch((err) => {
            log.warn(err, `mailer failed. invitation link: ${invitationLink}`);
          });
      });

      return completeInvitations;
    },
  );

  fastify.get<{ Params: IdParam }>(
    '/:id/invitations',
    { schema: getForItem },
    async ({ member, params }) => {
      // return invitations for given item
      const { id: itemId } = params;
      const tasks = taskManager.createGetforItemTaskSequence(member, { itemId });
      return runner.runSingleSequence(tasks);
    },
  );
};

export default basePlugin;
