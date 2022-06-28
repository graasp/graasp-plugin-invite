import { StatusCodes } from 'http-status-codes';

import { GraaspError, GraaspErrorDetails } from 'graasp';

export class GraaspInvitationError implements GraaspError {
  name: string;
  code: string;
  statusCode?: number;
  message: string;
  data?: unknown;
  origin: 'core' | 'plugin';

  constructor({ code, statusCode, message }: GraaspErrorDetails, data?: unknown) {
    this.name = code;
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    this.origin = 'plugin';
  }
}

export class DuplicateInvitationError extends GraaspInvitationError {
  constructor(data?: unknown) {
    super(
      {
        code: 'GPINVERR001',
        statusCode: StatusCodes.CONFLICT,
        message: 'An invitation already exists for this item and email pair',
      },
      data,
    );
  }
}

export class MemberAlreadyExistForEmailError extends GraaspInvitationError {
  constructor(data?: unknown) {
    super(
      {
        code: 'GPINVERR002',
        statusCode: StatusCodes.CONFLICT,
        message: 'This email is already associated with a member',
      },
      data,
    );
  }
}
