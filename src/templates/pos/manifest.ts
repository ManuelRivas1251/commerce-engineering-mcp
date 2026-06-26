/**
 * Template source: https://github.com/microsoft/Dynamics365Commerce.Solutions
 * Based on: src/ExtendedLogon/Pos/manifest.json (release/9.56)
 */
export interface ManifestTemplateParams {
  packageName: string;
  publisher: string;
  version: string;
  description: string;
  minimumPosVersion: string;
}

export interface ManifestTriggerEntry {
  name: string;
  description: string;
  triggerType: string;
  modulePath: string;
}

export interface ManifestOperationEntry {
  operationId: number;
  operationName: string;
  modulePath: string;
}

export interface ManifestViewEntry {
  name: string;
  description: string;
  modulePath: string;
}

export interface ManifestComponents {
  triggers?: ManifestTriggerEntry[];
  operations?: ManifestOperationEntry[];
  views?: ManifestViewEntry[];
}

export function renderManifest(
  p: ManifestTemplateParams,
  components: ManifestComponents = {}
): string {
  const manifest: Record<string, unknown> = {
    $schema: "devDependencies/schemas/manifestSchema.json",
    name: p.packageName,
    publisher: p.publisher,
    version: p.version,
    minimumPosVersion: p.minimumPosVersion,
    description: p.description,
    components: {
      extend: {
        ...(components.triggers?.length ? { triggers: components.triggers } : {}),
        ...(components.operations?.length ? { operations: components.operations } : {}),
        ...(components.views?.length ? { views: components.views } : {}),
      },
    },
  };

  return JSON.stringify(manifest, null, "\t");
}
