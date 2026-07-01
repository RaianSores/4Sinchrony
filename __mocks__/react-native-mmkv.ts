const mockStorage: Record<string, string> = {};

export const createMMKV = jest.fn(() => ({
  getString: jest.fn((key: string) => mockStorage[key] ?? null),
  set: jest.fn((key: string, value: string) => { mockStorage[key] = value; }),
  delete: jest.fn((key: string) => { delete mockStorage[key]; }),
  clearAll: jest.fn(() => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }),
  getAllKeys: jest.fn(() => Object.keys(mockStorage)),
  contains: jest.fn((key: string) => key in mockStorage),
}));

export const MMKV = createMMKV;
