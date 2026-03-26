type UnknownRecord = Record<string, unknown>;

interface ApiEnvelope {
  error?: string;
  code?: string;
  message?: string;
  detail?: string;
  details?: UnknownRecord | string[] | string;
}

function toObject(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' ? (value as UnknownRecord) : null;
}

function flattenDetails(details: ApiEnvelope['details']): string[] {
  if (!details) return [];
  if (typeof details === 'string') return [details];
  if (Array.isArray(details)) return details.map((v) => String(v));
  if (typeof details === 'object') {
    return Object.entries(details).flatMap(([field, value]) => {
      if (Array.isArray(value)) return value.map((msg) => `${field}: ${String(msg)}`);
      if (value && typeof value === 'object') return [`${field}: ${JSON.stringify(value)}`];
      return [`${field}: ${String(value)}`];
    });
  }
  return [];
}

export function extractApiErrorMessage(error: unknown, fallback: string): string {
  const errObj = toObject(error);
  const response = errObj ? toObject(errObj.response) : null;
  const data = response ? (toObject(response.data) as ApiEnvelope | null) : null;

  if (data) {
    const summary = data.error || data.message || data.detail;
    const detailLines = flattenDetails(data.details);
    if (summary && detailLines.length > 0) return `${summary}\n${detailLines.join('\n')}`;
    if (summary) return summary;
    if (detailLines.length > 0) return detailLines.join('\n');
  }

  const directMessage =
    (errObj && typeof errObj.message === 'string' && errObj.message) ||
    (response && typeof response.statusText === 'string' && response.statusText);

  return directMessage || fallback;
}

