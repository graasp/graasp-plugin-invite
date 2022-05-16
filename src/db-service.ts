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
      ['item_path', 'itemPath'],
      'name',
      'email',
      'permission',
      ['created_at', 'createdAt'],
      ['updated_at', 'updatedAt'],
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
          "item_path",
          "email",
          "name",
          "permission"
        )
        VALUES (
            ${invitation.creator},
            ${invitation.itemPath},
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
   * Get invitation by id or null if it is not found
   * @param id Invitation id
   * @param transactionHandler Database transaction handler
   */
  async get(id: string, transactionHandler: TrxHandler): Promise<Invitation> {
    return transactionHandler
      .query<Invitation>(
        sql`
        SELECT ${InvitationService.allColumns}
        FROM invitation
        WHERE id = ${id}
      `,
      )
      .then(({ rows }) => rows[0] || null);
  }

  /**
   * Get invitation for item path and below
   * @param itemPath Item path
   * @param transactionHandler Database transaction handler
   */
  async getForItem(
    itemPath: string,
    transactionHandler: TrxHandler,
  ): Promise<readonly Invitation[]> {
    return transactionHandler
      .query<Invitation>(
        sql`
        SELECT ${InvitationService.allColumns}
        FROM invitation
        WHERE ${itemPath} @> item_path
      `,
      )
      .then(({ rows }) => rows);
  }

  /**
   * Get invitation by member id
   * @param id Item id
   * @param transactionHandler Database transaction handler
   */
  async getForMember(
    email: string,
    transactionHandler: TrxHandler,
  ): Promise<readonly Invitation[]> {
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
   * Update invitation
   * @see database_schema.sql
   * @param id Item id
   * @param transactionHandler Database transaction handler
   */
  async update(
    id: string,
    data: Partial<Invitation>,
    transactionHandler: TrxHandler,
  ): Promise<Invitation> {
    // dynamically build "column1 = value1, column2 = value2, ..." based on the
    // properties present in data
    const setValues = sql.join(
      Object.keys(data).map((key: keyof Invitation) =>
        sql.join([sql.identifier([key]), sql`${data[key]}`], sql` = `),
      ),
      sql`, `,
    );

    return transactionHandler
      .query<Invitation>(
        sql`
        UPDATE invitation
        SET ${setValues}
        WHERE id = ${id}
        RETURNING ${InvitationService.allColumns}
      `,
      )
      .then(({ rows }) => rows[0] || null);
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
