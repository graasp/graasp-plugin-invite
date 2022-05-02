export default {
  $id: 'http://graasp.org/invitations/',
  definitions: {
    invitation: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        memberId: { type: 'string' },
        itemId: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        permission: { type: 'string' },
        createdAt: { type: 'string' },
      },
      additionalProperties: false,
    },

    // partial invitation requiring some properties to be defined
    // item id is defined from the param of the endpoint
    partialInvitation: {
      type: 'object',
      required: ['email', 'permission'],
      properties: {
        email: { type: 'string' },
        permission: { type: 'string' },
        name: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
};

export const invite = {
  params: { $ref: 'http://graasp.org/#/definitions/idParam' },
  body: {
    type: 'object',
    properties: {
      invitations: {
        type: 'array',
        items: { $ref: 'http://graasp.org/invitations/#/definitions/partialInvitation' },
      },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      type: 'array',
      items: { $ref: 'http://graasp.org/invitations/#/definitions/invitation' },
    },
  },
};

export const getForItem = {
  params: { $ref: 'http://graasp.org/#/definitions/idParam' },
  response: {
    200: {
      type: 'array',
      items: { $ref: 'http://graasp.org/invitations/#/definitions/invitation' },
    },
  },
};
