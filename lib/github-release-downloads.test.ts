import { fetchGithubReleaseDownloads } from './github-release-downloads';

function jsonResponse(
  body: unknown,
  init?: { status?: number; headers?: Record<string, string> }
): Response {
  const status = init?.status ?? 200;
  const headers = init?.headers ?? {};
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

describe('fetchGithubReleaseDownloads', () => {
  it('should reject invalid owner/repo', async () => {
    const res = await fetchGithubReleaseDownloads({
      owner: '',
      repo: 'IMRF',
      metric: 'total',
      fetchFn: async () => jsonResponse([]),
    });
    expect(res.ok).toBe(false);
    expect(res.httpStatus).toBe(400);
    expect(res.downloads).toBe(0);
  });

  it('should sum downloads for latest release', async () => {
    const fetchFn = jest.fn(async () =>
      jsonResponse(
        {
          assets: [{ download_count: 3 }, { download_count: 7 }],
        },
        { headers: { 'x-ratelimit-remaining': '4999' } }
      )
    );

    const res = await fetchGithubReleaseDownloads({
      owner: 'octocat',
      repo: 'Hello-World',
      metric: 'latest',
      fetchFn,
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(res.ok).toBe(true);
    expect(res.downloads).toBe(10);
    expect(res.rateLimited).toBe(false);
  });

  it('should sum downloads across pages for total metric', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse([
          { assets: [{ download_count: 1 }, { download_count: 2 }] },
          { assets: [{ download_count: 3 }] },
        ])
      )
      .mockResolvedValueOnce(jsonResponse([{ assets: [{ download_count: 4 }] }]));

    const res = await fetchGithubReleaseDownloads({
      owner: 'octocat',
      repo: 'Hello-World',
      metric: 'total',
      perPage: 2,
      maxPages: 10,
      fetchFn,
    });

    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(res.ok).toBe(true);
    expect(res.downloads).toBe(10);
  });

  it('should return partial downloads and ok=false on HTTP errors', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse([{ assets: [{ download_count: 5 }] }], { status: 200 })
      )
      .mockResolvedValueOnce(jsonResponse({ message: 'boom' }, { status: 500 }));

    const res = await fetchGithubReleaseDownloads({
      owner: 'octocat',
      repo: 'Hello-World',
      metric: 'total',
      perPage: 1,
      maxPages: 10,
      fetchFn,
    });

    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(res.ok).toBe(false);
    expect(res.httpStatus).toBe(500);
    expect(res.downloads).toBe(5);
  });

  it('should mark rateLimited when remaining is 0', async () => {
    const fetchFn = jest.fn(async () =>
      jsonResponse(
        { assets: [{ download_count: 1 }] },
        { headers: { 'x-ratelimit-remaining': '0' } }
      )
    );

    const res = await fetchGithubReleaseDownloads({
      owner: 'octocat',
      repo: 'Hello-World',
      metric: 'latest',
      fetchFn,
    });

    expect(res.ok).toBe(true);
    expect(res.rateLimited).toBe(true);
  });
});
