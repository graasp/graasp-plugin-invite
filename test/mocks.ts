import { ItemMembershipService } from '@graasp/sdk';
import { Task as MockTask } from 'graasp-test';

import { InvitationService } from '../src/db-service';
import InvitationTaskManager from '../src/task-manager';
import CreateMembershipFromInvitationTask from '../src/tasks/create-membership-from-invitation-task';
import { FIXTURES_INVITATIONS, FIXTURE_MEMBERSHIP } from './fixtures';

export const mockCreateMembershipFromInvitationTask = (runner, data) => {
  const mockCreateMembership = jest
    .spyOn(InvitationService.prototype, 'createMembership')
    .mockImplementation((partialMember, handler) => Promise.resolve(FIXTURE_MEMBERSHIP));

  const mockDelete = jest
    .spyOn(InvitationService.prototype, 'delete')
    .mockImplementation((id, handler) => Promise.resolve(FIXTURES_INVITATIONS[0]));

  return [mockCreateMembership, mockDelete];
};

export const mockGetForMember = (data) => {
  jest.spyOn(InvitationService.prototype, 'getForMember').mockResolvedValue(data);
};

export const mockRunMultiple = (runner, data) => {
  jest.spyOn(runner, 'runMultiple').mockResolvedValue(data);
};

export const mockCreateTaskSequence = (runner, item, data) => {
  jest
    .spyOn(InvitationTaskManager.prototype, 'createCreateTaskSequence')
    .mockImplementation(() => [new MockTask(item)]);

  jest.spyOn(runner, 'runMultipleSequences').mockImplementation(async () => {
    return data;
  });
};

export const mockGetTask = (runner, data) => {
  jest
    .spyOn(InvitationTaskManager.prototype, 'createGetTask')
    .mockImplementation(() => new MockTask());

  jest.spyOn(runner, 'runSingle').mockImplementation(async () => {
    return data;
  });
};

export const mockGetforItemTaskSequence = (runner, data) => {
  jest
    .spyOn(InvitationTaskManager.prototype, 'createGetforItemTaskSequence')
    .mockImplementation(() => []);

  jest.spyOn(runner, 'runSingleSequence').mockImplementation(async () => {
    return data;
  });
};

export const mockCreateUpdateInvitationTaskSequence = (runner, data) => {
  jest
    .spyOn(InvitationTaskManager.prototype, 'createUpdateInvitationTaskSequence')
    .mockImplementation(() => []);

  jest.spyOn(runner, 'runSingleSequence').mockImplementation(async () => {
    return data;
  });
};

export const mockCreateDeleteInvitationTaskSequence = (runner, data) => {
  jest
    .spyOn(InvitationTaskManager.prototype, 'createDeleteInvitationTaskSequence')
    .mockImplementation(() => []);

  jest.spyOn(runner, 'runSingleSequence').mockImplementation(async () => {
    return data;
  });
};
