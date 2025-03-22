export enum SkeletonStatus {
  CMM = "CMM",
  Laboratory = "Laboratory",
  Customer = "Customer",
  Released = "Released",
  Rejected = "Rejected",
  USED = "Used",
}

export enum SkeletonPlatform {
  A = "A",
  B = "B",
}

export enum SkeletonType {
  AFA3G_AA = "AFA3G_AA",
  AFA3G_A = "AFA3G_A",
}

export interface CustomToolbarProps {
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddClick: () => void;
  isImporting: boolean;
} 