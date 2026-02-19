import React from 'react';
import { AlertTriangle } from 'lucide-react';

const FirebaseConfigPanel = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Firebase Configuration</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Setup your Firebase project for push notifications</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 border border-gray-100 dark:border-slate-700">
                <div className="flex items-start gap-4 mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-800 dark:text-amber-200">
                    <AlertTriangle className="w-6 h-6 shrink-0" />
                    <div>
                        <p className="font-semibold">Server-Side Configuration Required</p>
                        <p className="text-sm mt-1">
                            For security reasons, Firebase Admin credentials should be configured in your server's environment variables (<code>.env</code>).
                            Do not expose your private key in the frontend.
                        </p>
                    </div>
                </div>

                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Setup Steps</h3>
                <ol className="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300">
                    <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Firebase Console</a>.</li>
                    <li>Create a new project or select an existing one.</li>
                    <li>Navigate to <strong>Project Settings</strong> &gt; <strong>Service Accounts</strong>.</li>
                    <li>Click <strong>Generate New Private Key</strong>. This will download a <code>.json</code> file.</li>
                    <li>Open the <code>.json</code> file and copy the <code>project_id</code>, <code>client_email</code>, and <code>private_key</code>.</li>
                    <li>Add these to your server's <code>.env</code> file:</li>
                </ol>

                <div className="mt-6 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-green-400">
                        FIREBASE_PROJECT_ID=your-project-id{'\n'}
                        FIREBASE_CLIENT_EMAIL=your-service-account-email{'\n'}
                        FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default FirebaseConfigPanel;
