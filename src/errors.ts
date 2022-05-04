import { GraaspErrorDetails, GraaspError } from 'graasp';

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
