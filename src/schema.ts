export default {
  $id: 'http://graasp.org/invitations/',
  definitions: {
    invitation: {
      type: 'object',
      properties: {
        id: { $ref: 'http://graasp.org/#/definitions/uuid' },
        creator: { $ref: 'http://graasp.org/#/definitions/uuid' },
        itemId: { $ref: 'http://graasp.org/#/definitions/uuid' },
        email: { type: 'string', format: 'email' },
        name: { type: ['string', 'null'] },
        permission: { type: 'string' },
        /**
         * for some reason setting these date fields as "type: 'string'"
         * makes the serialization fail using the anyOf. Following the same
         * logic from above, here it's also safe to just remove that specification.
         */
        createdAt: {},
      },
      additionalProperties: false,
    },

    // partial invitation requiring some properties to be defined
    // item id is defined from the param of the endpoint
    partialInvitation: {
      type: 'object',
      required: ['email', 'permission'],
      properties: {
        email: { type: 'string', format: 'email' },
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
      items: {
        anyOf: [
          { $ref: 'http://graasp.org/#/definitions/error' },
          { $ref: 'http://graasp.org/invitations/#/definitions/invitation' },
        ],
      },
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

export const getById = {
  params: { $ref: 'http://graasp.org/#/definitions/idParam' },
  response: {
    200: { $ref: 'http://graasp.org/invitations/#/definitions/invitation' },
  },
};
