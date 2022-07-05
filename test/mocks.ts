import MockTask from 'graasp-test/src/tasks/task';

import { InvitationService } from '../src/db-service';
import InvitationTaskManager from '../src/task-manager';

export const mockCreateMembershipFromInvitationTask = (runner, data) => {
  return jest
    .spyOn(InvitationTaskManager.prototype, 'createCreateMembershipFromInvitationTask')
    .mockImplementation(() => data);
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
