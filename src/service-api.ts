import { StatusCodes } from 'http-status-codes';

import { FastifyPluginAsync } from 'fastify';

import { Actor, IdParam, Member } from '@graasp/sdk';
import mailerPlugin from 'graasp-mailer';

import { InvitationService } from './db-service';
import Invitation from './interfaces/invitation';
import definitions, { deleteOne, getById, getForItem, invite, sendOne, updateOne } from './schema';
import InvitationTaskManager from './task-manager';
import { BuildInvitationLinkFunction } from './types';

export interface GraaspPluginInvitationsOptions {
  buildInvitationLink: BuildInvitationLinkFunction;
  graaspActor: Actor;
}

const basePlugin: FastifyPluginAsync<GraaspPluginInvitationsOptions> = async (fastify, options) => {
  const { buildInvitationLink, graaspActor } = options;
  const {
    taskRunner: runner,
    items: { taskManager: iTM },
    itemMemberships: { taskManager: iMTM },
    members: { taskManager: mTM, dbService: mS },
    mailer,
  } = fastify;

  if (!mailerPlugin) {
    throw new Error('Mailer plugin is not defined');
  }

  const dbService = new InvitationService();
  const taskManager = new InvitationTaskManager(dbService, iTM, iMTM, mS);

  fastify.addSchema(definitions);

  const sendInvitationEmail = ({ item, member, invitation, log }) => {
    const invitationLink = buildInvitationLink(invitation);
    const lang = member?.extra?.lang as string;

    mailer
      .sendInvitationEmail(invitation.email, invitationLink, item.name, member.name, lang)
      .catch((err) => {
        log.warn(err, `mailer failed. invitation link: ${invitationLink}`);
      });
  };

  // on member creation, invitations become memberships
  const createCreateTaskName = mTM.getCreateTaskName();
  runner.setTaskPostHookHandler(
    createCreateTaskName,
    async (member: Member, _actor, { handler, log }) => {
      // replace invitations to memberships
      const invitations = await dbService.getForMember(member.email, handler);
      if (invitations.length) {
        const tasks = invitations.map((invitation) =>
          taskManager.createCreateMembershipFromInvitationTask(member, {
            invitation,
            memberId: member.id,
          }),
        );
        // don't need to await
        // reuse handler of transaction (avoid creating additional connections)
        tasks.forEach(t =>t.run(handler, log));
      }
    },
  );

  // get an invitation by id
  // do not require authentication
  fastify.get<{ Params: IdParam }>('/invitations/:id', { schema: getById }, async ({ params }) => {
    const { id } = params;
    const task = taskManager.createGetTask(graaspActor, { id });
    return runner.runSingle(task);
  });

  fastify.register(async function (fastify) {
    fastify.addHook('preHandler', fastify.verifyAuthentication);

    fastify.post<{ Params: IdParam; Body: { invitations: Partial<Invitation>[] } }>(
      '/:id/invite',
      {
        schema: invite,
      },
      async ({ member, body, params, log }) => {
        const { id: itemId } = params;
        const { invitations } = body;
        const sequences = invitations.map((invitation) =>
          taskManager.createCreateTaskSequence(member, { itemId, invitation }),
        );

        const completeInvitations = (await runner.runMultipleSequences(sequences)) as Invitation[];
        if (completeInvitations.length) {
          const [getItemTask] = sequences[0];
          const { result: item } = getItemTask;

          log.debug('send invitation mails');
          completeInvitations.forEach((invitation) => {
            // send mail without awaiting
            sendInvitationEmail({ item, invitation, log, member });
          });
        }

        return completeInvitations;
      },
    );

    // get all invitations for an item
    fastify.get<{ Params: IdParam }>(
      '/:id/invitations',
      { schema: getForItem },
      async ({ member, params }) => {
        const { id: itemId } = params;
        const tasks = taskManager.createGetforItemTaskSequence(member, { itemId });
        return runner.runSingleSequence(tasks);
      },
    );

    // update invitation
    fastify.patch<{ Params: { id: string; invitationId: string }; Body: Partial<Invitation> }>(
      '/:id/invitations/:invitationId',
      { schema: updateOne },
      async ({ member, params, body }) => {
        const { id: itemId, invitationId } = params;
        const tasks = taskManager.createUpdateInvitationTaskSequence(member, {
          itemId,
          invitationId,
          body,
        });
        return runner.runSingleSequence(tasks);
      },
    );

    // delete invitation
    fastify.delete<{ Params: { id: string; invitationId: string } }>(
      '/:id/invitations/:invitationId',
      { schema: deleteOne },
      async ({ member, params }) => {
        const { id: itemId, invitationId } = params;
        const tasks = taskManager.createDeleteInvitationTaskSequence(member, {
          itemId,
          invitationId,
        });
        return runner.runSingleSequence(tasks);
      },
    );

    // resend invitation mail
    fastify.post<{ Params: { id: string; invitationId: string } }>(
      '/:id/invitations/:invitationId/send',
      { schema: sendOne },
      async ({ member, params, log }, reply) => {
        const { id: itemId, invitationId } = params;
        const tasks = iTM.createGetTaskSequence(member, itemId);
        const invitationTask = taskManager.createGetTask(member, { id: invitationId });
        const invitation = await runner.runSingleSequence([...tasks, invitationTask]);

        const [getItemTask] = tasks;
        const { result: item } = getItemTask;
        sendInvitationEmail({ item, invitation, log, member });
        reply.status(StatusCodes.NO_CONTENT);
      },
    );
  });
};

export default basePlugin;
