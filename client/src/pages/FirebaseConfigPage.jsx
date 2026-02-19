import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Settings, Save, AlertTriangle } from 'lucide-react';

const FirebaseConfigPage = () => {
    // This is a dummy page since we are using .env in background. 
    // Ideally this would save to a DB or .env file if we had an API for it.
    // For now, we will just show a guide.

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-12">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Firebase Configuration</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Setup your Firebase project for push notifications</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 border border-gray-100 dark:border-slate-700">
                    <div className="flex items-start gap-4 mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-800 dark:text-amber-200">
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                        <div>
                            <p className="font-semibold">Server-Side Configuration Required</p>
                            <p className="text-sm mt-1">
                                For security reasons, Firebase Admin credentials should be configured in your server's environment variables (`.env`).
                                Do not expose your private key in the frontend.
                            </p>
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Setup Steps</h2>
                    <ol className="list-decimal list-inside space-y-4 text-gray-700 dark:text-gray-300">
                        <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" className="text-indigo-600 hover:underline">Firebase Console</a>.</li>
                        <li>Create a new project or select an existing one.</li>
                        <li>Navigate to <strong>Project Settings</strong> &gt; <strong>Service Accounts</strong>.</li>
                        <li>Click <strong>Generate New Private Key</strong>. This will download a `.json` file.</li>
                        <li>Open the `.json` file and copy the `project_id`, `client_email`, and `private_key`.</li>
                        <li>Add these to your server's `.env` file:</li>
                    </ol>

                    <div className="mt-6 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm font-mono text-green-400">
                            FIREBASE_PROJECT_ID=your-project-id<br />
                            FIREBASE_CLIENT_EMAIL=your-service-account-email<br />
                            FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FirebaseConfigPage;
