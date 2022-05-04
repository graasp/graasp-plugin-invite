import MockTask from 'graasp-test/src/tasks/task';
import { InvitationService } from '../src/db-service';
import InvitationTaskManager from '../src/task-manager';

export const mockCreateMembershipFromInvitationTaskSequence = (data) => {
  return jest
    .spyOn(InvitationTaskManager.prototype, 'createCreateMembershipFromInvitationTaskSequence')
    .mockImplementation(() => data);
};

export const mockGetForMember = (data) => {
  jest.spyOn(InvitationService.prototype, 'getForMember').mockResolvedValue(data);
};

export const mockRunMultipleSequences = (runner, data) => {
  jest.spyOn(runner, 'runMultipleSequences').mockResolvedValue(data);
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
