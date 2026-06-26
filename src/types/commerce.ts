export interface CommerceVersion {
  version: string;
  branch: string;
  sdkPackageVersion: string | null;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
  detectedFrom: string | null;
}

export type CommerceArea = "POS" | "CRT" | "RetailServer" | "HardwareStation";

export type CommerceArtifactType =
  | "Operation"
  | "Trigger"
  | "Request"
  | "Response"
  | "Handler"
  | "Dialog"
  | "View"
  | "Control"
  | "CRTService"
  | "RetailServerAPI"
  | "HardwareStationExtension";

export interface CommerceArtifact {
  name: string;
  type: CommerceArtifactType;
  area: CommerceArea;
  filePath: string;
  namespace?: string;
}

export interface WorkspaceIndex {
  schemaVersion: "1.0";
  lastUpdated: string;
  workspacePath: string;
  version: CommerceVersion | null;
  operations: CommerceArtifact[];
  triggers: CommerceArtifact[];
  requests: CommerceArtifact[];
  responses: CommerceArtifact[];
  dialogs: CommerceArtifact[];
  views: CommerceArtifact[];
  controls: CommerceArtifact[];
  crt: CommerceArtifact[];
  retailServer: CommerceArtifact[];
  hardwareStation: CommerceArtifact[];
}

export interface PatternValidationResult {
  valid: boolean;
  officialPattern?: string;
  sourceUrl?: string;
  alternative?: string;
  reason?: string;
}

export interface AntiHallucinationResult {
  confidence: "HIGH" | "MEDIUM" | "LOW" | "BLOCKED";
  sourceUrl: string | null;
  retrievedAt: string | null;
  reason?: string;
}
