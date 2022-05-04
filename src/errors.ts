import { GraaspErrorDetails, GraaspError } from 'graasp';
import { StatusCodes } from 'http-status-codes';

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
      { code: 'GPINVERR002', statusCode: StatusCodes.CONFLICT, message: 'Invitation already exists or has a different membership for item and email pair' },
      data,
    );
  }
}
