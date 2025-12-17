export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <div className="p-6 my-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            {title && <h3 className="font-semibold text-lg mb-2">{title}</h3>}
            <div>{children}</div>
        </div>
    );
}
