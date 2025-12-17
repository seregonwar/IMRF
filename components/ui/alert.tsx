import clsx from 'clsx';

type AlertType = 'info' | 'warning' | 'error' | 'success';

export function Alert({ type = 'info', children }: { type?: AlertType; children: React.ReactNode }) {
    const styles = {
        info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
        error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
        success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
    };

    return (
        <div className={clsx('p-4 my-4 border rounded-md', styles[type])}>
            <div className="flex items-start">
                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
}
