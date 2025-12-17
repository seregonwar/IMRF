import { validateDocs, ValidationError } from '@/lib/validator';
import { getDocSlugs } from '@/lib/markdown';

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    const errors = await validateDocs();
    const slugs = getDocSlugs();
    const totalDocs = slugs.length;
    const criticalErrors = errors.filter(e => e.type === 'error').length;
    const warnings = errors.filter(e => e.type === 'warning').length;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">System Debug Dashboard</h1>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <StatCard title="Total Documents" value={totalDocs} />
                <StatCard title="Critical Errors" value={criticalErrors} color="bg-red-100 dark:bg-red-900" />
                <StatCard title="Warnings" value={warnings} color="bg-yellow-100 dark:bg-yellow-900" />
            </div>

            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-4">Validation Log</h2>
                    {errors.length === 0 ? (
                        <div className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 rounded text-green-700 dark:text-green-100">
                            No issues found. System is healthy.
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {errors.map((err, i) => (
                                <li key={i} className={`p-4 rounded border ${err.type === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-900/30' : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30'
                                    }`}>
                                    <div className="flex items-center gap-2 font-semibold">
                                        <span className={`uppercase text-xs px-2 py-0.5 rounded ${err.type === 'error' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                                            }`}>{err.type}</span>
                                        <span>{err.file}</span>
                                    </div>
                                    <p className="mt-1 text-gray-700 dark:text-gray-300">{err.message}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Route Explorer</h2>
                    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto h-64 font-mono text-sm">
                        {slugs.map((s, i) => (
                            <div key={i}>/docs/{s.slug.join('/')}</div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatCard({ title, value, color = 'bg-gray-100 dark:bg-gray-800' }: { title: string; value: number; color?: string }) {
    return (
        <div className={`p-6 rounded-lg ${color}`}>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</div>
            <div className="text-3xl font-bold mt-2">{value}</div>
        </div>
    );
}
