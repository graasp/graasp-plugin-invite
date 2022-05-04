import { ItemMembership } from 'graasp';
import { sql, DatabaseTransactionConnection as TrxHandler } from 'slonik';
import { BaseInvitation } from './base-invitation';
import Invitation from './interfaces/invitation';

/**
 * Database's first layer of abstraction for Invitations
 */
export class InvitationService {
  // the 'safe' way to dynamically generate the columns names:
  private static allColumns = sql.join(
    [
      'id',
      ['creator', 'creator'],
      ['item_id', 'itemId'],
      'name',
      'email',
      'permission',
      ['created_at', 'createdAt'],
    ].map((c) =>
      !Array.isArray(c)
        ? sql.identifier([c])
        : sql.join(
          c.map((cwa) => sql.identifier([cwa])),
          sql` AS `,
        ),
    ),
    sql`, `,
  );

  /**
   * Create invitation and return it.
   * @param invitation Invitation to create
   * @param transactionHandler Database transaction handler
   */
  async create(invitation: BaseInvitation, transactionHandler: TrxHandler): Promise<Invitation> {
    return transactionHandler
      .query<Invitation>(
        sql`
        INSERT INTO "invitation" (
          "creator",
          "item_id",
          "email",
          "name",
          "permission"
        )
        VALUES (
            ${invitation.creator},
            ${invitation.itemId},
            ${invitation.email},
            ${invitation.name},
            ${invitation.permission}
        )
        RETURNING ${InvitationService.allColumns}
      `,
      )
      .then(({ rows }) => rows[0]);
  }

  /**
   * Get item matching the given `id` or `null`, if not found.
   * @param id Item id
   * @param transactionHandler Database transaction handler
   */
  async getForItem(id: string, transactionHandler: TrxHandler): Promise<readonly Invitation[]> {
    return transactionHandler
      .query<Invitation>(
        sql`
        SELECT ${InvitationService.allColumns}
        FROM invitation
        WHERE item_id = ${id}
      `,
      )
      .then(({ rows }) => rows);
  }

  /**
   * Get item matching the given `id` or `null`, if not found.
   * @param id Item id
   * @param transactionHandler Database transaction handler
   */
  async getForMember(email: string, transactionHandler: TrxHandler): Promise<readonly Invitation[]> {
    return transactionHandler
      .query<Invitation>(
        sql`
        SELECT ${InvitationService.allColumns}
        FROM invitation
        WHERE email = ${email}
      `,
      )
      .then(({ rows }) => rows);
  }

  /**
   * Delete invitation
   * @see database_schema.sql
   * @param id Item id
   * @param transactionHandler Database transaction handler
   */
  async delete(id: string, transactionHandler: TrxHandler): Promise<Invitation> {
    return transactionHandler
      .query<Invitation>(
        sql`
        DELETE FROM invitation
        WHERE id = ${id}
        RETURNING ${InvitationService.allColumns}
      `,
      )
      .then(({ rows }) => rows[0] || null);
  }

  /**
   * Create item membership from invitation and return it.
   * @param invitation Invitation
   * @param transactionHandler Database transaction handler
   */
  async createMembership(
    membership: Partial<ItemMembership>,
    transactionHandler: TrxHandler,
  ): Promise<ItemMembership> {
    return transactionHandler
      .query<ItemMembership>(
        sql`
        INSERT INTO item_membership (
          "creator",  
          "member_id",
          "item_path",
          "permission"
        )
        VALUES (
            ${membership.creator},
            ${membership.memberId},
            ${membership.itemPath},
            ${membership.permission}
        )
      `,
      )
      .then(({ rows }) => rows[0]);
  }
}
