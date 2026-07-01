const mockKeychain: Record<string, string> = {};

module.exports = {
  SECURITY_LEVEL_ANY: 'MOCK',
  SECURITY_LEVEL_SECURE_SOFTWARE: 'MOCK',
  SECURITY_LEVEL_SECURE_HARDWARE: 'MOCK',
  ACCESSIBLE_WHEN_UNLOCKED: 'MOCK',
  setGenericPassword: jest.fn(async (service: string, username: string, password: string) => {
    mockKeychain[service] = password;
    return { service, username, password };
  }),
  getGenericPassword: jest.fn(async (options: { service: string }) => {
    const password = mockKeychain[options.service] ?? null;
    return password ? { service: options.service, username: 'user', password } : false;
  }),
  resetGenericPassword: jest.fn(async (options: { service: string }) => {
    delete mockKeychain[options.service];
    return true;
  }),
};
