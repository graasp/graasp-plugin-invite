import fastify from 'fastify';

import { ItemMembershipTaskManager, MemberTaskManager } from '@graasp/sdk';
import { ItemTaskManager, TaskRunner } from 'graasp-test';

import plugin from '../src/service-api';
import { BuildInvitationLinkFunction } from '../src/types';
import { GRAASP_ACTOR } from './fixtures';

const schemas = {
  $id: 'http://graasp.org/',
  definitions: {
    uuid: {
      type: 'string',
      pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
    },
    idParam: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { $ref: '#/definitions/uuid' },
      },
      additionalProperties: false,
    },
    error: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        code: { type: 'string' },
        message: { type: 'string' },
        statusCode: { type: 'number' },
        data: {},
        origin: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
};

const build = async ({
  runner,
  itemTaskManager,
  itemMembershipTaskManager,
  memberTaskManager,
  sendInvitationEmail,
  buildInvitationLink,
}: {
  runner: TaskRunner;
  itemTaskManager: ItemTaskManager;
  itemMembershipTaskManager: ItemMembershipTaskManager;
  memberTaskManager: MemberTaskManager;
  // eslint-disable-next-line @typescript-eslint/ban-types
  sendInvitationEmail?: Function;
  buildInvitationLink?: BuildInvitationLinkFunction;
}) => {
  const app = fastify();
  app.addSchema(schemas);

  app.decorate('verifyAuthentication', jest.fn().mockResolvedValue(true));
  app.decorateRequest('member', GRAASP_ACTOR);

  app.decorate('items', { taskManager: itemTaskManager });
  app.decorate('itemMemberships', { taskManager: itemMembershipTaskManager });
  app.decorate('members', { taskManager: memberTaskManager });
  app.decorate('taskRunner', runner);
  app.decorate('mailer', {
    sendInvitationEmail:
      sendInvitationEmail ??
      jest.fn().mockImplementation(async () => {
        // do nothing
      }),
  });
  await app.register(plugin, {
    buildInvitationLink: buildInvitationLink ?? jest.fn(),
    graaspActor: GRAASP_ACTOR,
  });

  return app;
};
export default build;
