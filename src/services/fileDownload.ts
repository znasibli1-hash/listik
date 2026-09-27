import { downloadText } from '@/utils/csv';

interface DownloadsApi { save(req: { filename: string; data: string | Blob }): Promise<{ status: string }> }
interface ClaudeRuntime { use(name: string): Promise<unknown> }

let downloadsApi: Promise<DownloadsApi | null> | null = null;

/** Resolve the hosted-viewer download capability once, or null when running standalone. */
function getDownloadsApi(): Promise<DownloadsApi | null> {
  if (!downloadsApi) {
    const runtime = (window as unknown as { claude?: ClaudeRuntime }).claude;
    downloadsApi = runtime?.use
      ? runtime.use('downloads').then((api) => (api as DownloadsApi | null) ?? null).catch(() => null)
      : Promise.resolve(null);
  }
  return downloadsApi;
}

/**
 * Save a CSV for the viewer.
 * - Inside the claude.ai artifact viewer: uses the `downloads` capability (viewer confirms).
 * - Anywhere else (your own hosting, `npm run dev`): a normal browser download.
 * Returns false if the viewer declined.
 */
export async function saveCsv(filename: string, csv: string): Promise<boolean> {
  const api = await getDownloadsApi();
  if (!api) { downloadText(filename, csv); return true; }
  try {
    await api.save({ filename, data: '\uFEFF' + csv });
    return true;
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === 'declined' || code === 'rate_limited') return false;
    downloadText(filename, csv);
    return true;
  }
}
