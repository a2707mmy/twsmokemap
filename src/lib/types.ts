// 共用型別定義

export type LatLng = { lat: number; lng: number };

export type SmokingAreaKind = 'indoor' | 'outdoor';
export type DataSource = 'official' | 'user';
export type ModerationStatus = 'approved' | 'pending';

/** 吸菸區 */
export interface SmokingArea {
  id: string;
  name: string;
  address: string | null;
  district: string | null;
  lat: number;
  lng: number;
  kind: SmokingAreaKind;
  source: DataSource;
  status: ModerationStatus;
  note: string | null;
  upvotes: number;
  created_at: string;
  /** 由 nearby RPC 回傳的距離（公尺），列表用 */
  distance_m?: number;
}

/** 煙味回報狀況（三選一，描述性用詞） */
export const REPORT_TYPES = {
  1: '我看到有人在抽菸',
  2: '我聞到濃烈煙味',
  3: '我聞到些微煙味',
} as const;

export type ReportType = keyof typeof REPORT_TYPES;

export type TimeSlot = 'morning' | 'noon' | 'evening' | 'night';

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: '早上',
  noon: '中午',
  evening: '傍晚',
  night: '深夜',
};

/** 煙味回報 */
export interface SmellReport {
  id: string;
  lat: number;
  lng: number;
  report_type: ReportType;
  time_slot: TimeSlot;
  note: string | null;
  created_at: string;
}
