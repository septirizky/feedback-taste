export type RowId = number;

export interface BranchFields {
  BranchCode: string;
  BranchName: string;
  BranchStatus?: string;
}

export interface StationFields {
  StationCode: string;
  DisplayName?: string;
  BranchCode: RowId;
  StationStatus?: string;
}

export interface SauceFields {
  SauceID?: string;
  SauceName: string;
  Description?: string;
  Image?: string;
}

export interface StationSauceFields {
  StationSauceID?: string;
  BranchCode: RowId;
  StationCode: RowId;
  SauceName: RowId;
  SauceDescription?: string;
  SauceImage?: string;
}

export type LikeChoice = "Like" | "Dislike";

export interface FeedbackFields {
  Branch: RowId;
  Station: RowId;
  Sauce: RowId;
  LikeValue?: LikeChoice | null;
  StarValue?: number | null;
  Comment?: string;
  SubmittedAt?: string;
  Source?: string;
  IpAddr?: string;
}
