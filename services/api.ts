import { AnalysisSummary, DataRow } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://narrative-analytics-engine.onrender.com";

export async function analyzeDataset(data: DataRow[], signal?: AbortSignal): Promise<AnalysisSummary> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to analyze text.');
  }

  return (await response.json()) as AnalysisSummary;
}
