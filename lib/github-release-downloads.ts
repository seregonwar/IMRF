export type GithubFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

export type ReleaseDownloadsMetric = 'total' | 'latest';

export interface FetchGithubReleaseDownloadsOptions {
  owner: string;
  repo: string;
  metric: ReleaseDownloadsMetric;
  token?: string;
  maxPages?: number;
  perPage?: number;
  fetchFn?: GithubFetch;
}

export interface FetchGithubReleaseDownloadsResult {
  downloads: number;
  ok: boolean;
  httpStatus?: number;
  rateLimited: boolean;
}

type GithubReleaseAsset = {
  download_count?: unknown;
};

type GithubRelease = {
  assets?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  const rounded = Math.trunc(value);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
}

function safeAdd(a: number, b: number): number {
  const sum = a + b;
  if (!Number.isSafeInteger(sum) || sum < 0) return Number.MAX_SAFE_INTEGER;
  return sum;
}

function parseDownloadsFromRelease(release: GithubRelease): number {
  const assetsUnknown = release.assets;
  if (!Array.isArray(assetsUnknown)) return 0;

  let total = 0;
  for (const assetUnknown of assetsUnknown) {
    const asset = assetUnknown as GithubReleaseAsset;
    const countUnknown = asset?.download_count;
    if (typeof countUnknown !== 'number') continue;
    if (!Number.isFinite(countUnknown)) continue;
    if (!Number.isInteger(countUnknown)) continue;
    if (countUnknown < 0) continue;
    total = safeAdd(total, countUnknown);
  }
  return total;
}

function parseDownloadsFromReleases(releases: unknown): number {
  if (!Array.isArray(releases)) return 0;
  let total = 0;
  for (const releaseUnknown of releases) {
    total = safeAdd(total, parseDownloadsFromRelease(releaseUnknown as GithubRelease));
  }
  return total;
}

function getRateLimitState(res: Response): boolean {
  const remaining = res.headers.get('x-ratelimit-remaining');
  const parsed = remaining === null ? NaN : Number(remaining);
  if (!Number.isFinite(parsed)) return false;
  return parsed <= 0;
}

function buildGithubHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'imrf-badge',
  };
  if (isNonEmptyString(token)) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }
  return headers;
}

function validateRepoParts(owner: string, repo: string): boolean {
  const ownerOk =
    isNonEmptyString(owner) &&
    owner.length <= 100 &&
    /^[A-Za-z0-9_.-]+$/.test(owner);
  const repoOk =
    isNonEmptyString(repo) &&
    repo.length <= 100 &&
    /^[A-Za-z0-9_.-]+$/.test(repo);
  return ownerOk && repoOk;
}

export async function fetchGithubReleaseDownloads(
  options: FetchGithubReleaseDownloadsOptions
): Promise<FetchGithubReleaseDownloadsResult> {
  const fetchFn: GithubFetch = options.fetchFn ?? fetch;
  const maxPages = clampInteger(options.maxPages ?? 10, 1, 20);
  const perPage = clampInteger(options.perPage ?? 100, 1, 100);
  const token = isNonEmptyString(options.token) ? options.token : undefined;

  if (!validateRepoParts(options.owner, options.repo)) {
    return { downloads: 0, ok: false, httpStatus: 400, rateLimited: false };
  }

  if (options.metric === 'latest') {
    const url = new URL(
      `https://api.github.com/repos/${options.owner}/${options.repo}/releases/latest`
    );
    const res = await fetchFn(url, { headers: buildGithubHeaders(token) });
    const rateLimited = getRateLimitState(res);
    if (!res.ok) {
      return { downloads: 0, ok: false, httpStatus: res.status, rateLimited };
    }
    const json = (await res.json()) as unknown;
    return {
      downloads: parseDownloadsFromRelease(json as GithubRelease),
      ok: true,
      httpStatus: res.status,
      rateLimited,
    };
  }

  let total = 0;
  for (let page = 1; page <= maxPages; page += 1) {
    const url = new URL(
      `https://api.github.com/repos/${options.owner}/${options.repo}/releases`
    );
    url.searchParams.set('per_page', String(perPage));
    url.searchParams.set('page', String(page));

    const res = await fetchFn(url, { headers: buildGithubHeaders(token) });
    const rateLimited = getRateLimitState(res);
    if (!res.ok) {
      return { downloads: total, ok: false, httpStatus: res.status, rateLimited };
    }

    const json = (await res.json()) as unknown;
    if (!Array.isArray(json)) {
      return { downloads: total, ok: false, httpStatus: 502, rateLimited };
    }

    total = safeAdd(total, parseDownloadsFromReleases(json));

    if (json.length < perPage) {
      return { downloads: total, ok: true, httpStatus: res.status, rateLimited };
    }
  }

  return { downloads: total, ok: true, httpStatus: 200, rateLimited: false };
}
