import { isMockEnabled } from '../../../src/shared/utils/isMockEnabled';

describe('isMockEnabled', () => {
  it('returns false in all environments', () => {
    expect(isMockEnabled()).toBe(false);
  });
});
