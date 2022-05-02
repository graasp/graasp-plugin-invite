import { FastifyLoggerInstance } from 'fastify';
import {
  Task,
  TaskStatus,
  Actor,
  DatabaseTransactionHandler,
  PreHookHandlerType,
  PostHookHandlerType,
  IndividualResultType,
} from 'graasp';
import { InvitationService } from '../db-service';

export abstract class BaseTask<A extends Actor, R> implements Task<Actor, R> {
  invitationService: InvitationService;

  protected _result: R;
  protected _message: string;
  readonly actor: A;
  protected _partialSubtasks: boolean;

  status: TaskStatus;
  targetId: string;
  data: Partial<IndividualResultType<R>>;
  preHookHandler?: PreHookHandlerType<R>;
  postHookHandler?: PostHookHandlerType<R>;

  input?: unknown;
  skip?: boolean;

  getInput?: () => unknown;
  getResult?: () => unknown;

  constructor(actor: A, invitationService: InvitationService) {
    this.actor = actor;
    this.invitationService = invitationService;
    this.status = 'NEW';
  }

  abstract get name(): string;
  get result(): R {
    return this._result;
  }
  get message(): string {
    return this._message;
  }

  abstract run(
    handler: DatabaseTransactionHandler,
    log: FastifyLoggerInstance,
  ): Promise<void | BaseTask<A, R>[]>;
}
