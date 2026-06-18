import axiosInstance from "@/utils/apiClient";

type BulkMasterResponse = Record<string, any[]>;

export async function fetchBulkMasters(
  masters: string[],
  options: { admin?: boolean; includeInactive?: boolean } = {},
): Promise<BulkMasterResponse> {
  const uniqueMasters = Array.from(
    new Set(
      (masters || [])
        .map((master) => String(master || "").trim())
        .filter(Boolean),
    ),
  );

  if (!uniqueMasters.length) {
    return {};
  }

  const response = await axiosInstance.post(
    options.admin ? "/masters/admin/bulk" : "/masters/bulk",
    {
      masters: uniqueMasters,
      include_inactive: Boolean(options.includeInactive),
    },
  );

  return response?.data?.data || {};
}

export function mapBulkMasters<T extends Record<string, string>>(
  payload: BulkMasterResponse,
  mapping: T,
): Record<keyof T, any[]> {
  const mappedEntries = Object.entries(mapping).map(([localKey, bulkKey]) => [
    localKey,
    payload?.[bulkKey] || [],
  ]);

  return Object.fromEntries(mappedEntries) as Record<keyof T, any[]>;
}
