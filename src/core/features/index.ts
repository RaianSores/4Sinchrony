export type FeatureFlag =
  | 'teacherMetrics'
  | 'realtimeAttendance'
  | 'qrCheckin'
  | 'teacherRealtime'
  | 'multiStudio'
  | 'referralProgram'
  | 'adminMobile';

const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  teacherMetrics: true,
  realtimeAttendance: false,
  qrCheckin: false,
  teacherRealtime: false,
  multiStudio: false,
  referralProgram: true,
  adminMobile: false,
};

let overrides: Partial<Record<FeatureFlag, boolean>> = {};

export const featureFlags = {
  isEnabled(flag: FeatureFlag): boolean {
    return overrides[flag] ?? DEFAULT_FLAGS[flag];
  },

  set(flag: FeatureFlag, value: boolean): void {
    overrides[flag] = value;
  },

  setMany(flags: Partial<Record<FeatureFlag, boolean>>): void {
    overrides = { ...overrides, ...flags };
  },

  reset(): void {
    overrides = {};
  },

  all(): Record<FeatureFlag, boolean> {
    const result = { ...DEFAULT_FLAGS };
    for (const key of Object.keys(overrides) as FeatureFlag[]) {
      result[key] = overrides[key]!;
    }
    return result;
  },
};
