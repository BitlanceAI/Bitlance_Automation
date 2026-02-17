import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Settings as SettingsIcon,
    Save,
    Trash2,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Eye,
    EyeOff
} from 'lucide-react';

import { saveUserSettings, getUserSettings, deleteUserSettings } from '../services/settingsService';

const SettingsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Use authenticated user ID
    const userId = user?.id;

    const [googleSheetId, setGoogleSheetId] = useState('');
    const [googleServiceEmail, setGoogleServiceEmail] = useState('');
    const [googlePrivateKey, setGooglePrivateKey] = useState('');
    const [showPrivateKey, setShowPrivateKey] = useState(false);

    const [loading, setLoading] = useState(false);
    const [configured, setConfigured] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [saveMessageType, setSaveMessageType] = useState(''); // 'success' or 'error'

    // Load existing settings on mount
    useEffect(() => {
        if (user) {
            loadSettings();
        }
    }, [user]);

    const loadSettings = async () => {
        try {
            const data = await getUserSettings(userId);
            if (data.configured) {
                setGoogleSheetId(data.googleSheetId || '');
                setGoogleServiceEmail(data.googleServiceEmail || '');
                setConfigured(true);
                // Don't load private key for security
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const handleSave = async () => {
        if (!googleSheetId || !googleServiceEmail || !googlePrivateKey) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        setLoading(true);
        try {
            const result = await saveUserSettings(userId, {
                googleSheetId,
                googleServiceEmail,
                googlePrivateKey
            });

            if (result.success) {
                showMessage('✅ Settings saved successfully!', 'success');
                setConfigured(true);
                // Clear private key from form for security
                setTimeout(() => {
                    setGooglePrivateKey('');
                }, 2000);
            } else {
                showMessage('❌ Failed to save settings: ' + result.error, 'error');
            }
        } catch (error) {
            showMessage('❌ Error saving settings: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete your Google Sheets configuration?')) {
            return;
        }

        setLoading(true);
        try {
            const result = await deleteUserSettings(userId);
            if (result.success) {
                setGoogleSheetId('');
                setGoogleServiceEmail('');
                setGooglePrivateKey('');
                setConfigured(false);
                showMessage('Settings deleted successfully', 'success');
            }
        } catch (error) {
            showMessage('Error deleting settings: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (message, type) => {
        setSaveMessage(message);
        setSaveMessageType(type);
        setTimeout(() => {
            setSaveMessage('');
            setSaveMessageType('');
        }, 5000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <div className="flex items-center gap-3">
                            <SettingsIcon className="text-indigo-600 dark:text-indigo-400" size={24} />
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                Settings
                            </h1>
                        </div>
                    </div>

                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto p-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 transition-colors duration-300">

                    {/* Title */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <SettingsIcon size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Google Sheets Integration
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Configure your Google Sheets credentials for article tracking
                            </p>
                        </div>
                    </div>

                    {/* Status Badge */}
                    {configured && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-3">
                            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                            <span className="text-green-800 dark:text-green-300 font-medium">
                                Google Sheets is configured and ready to use
                            </span>
                        </div>
                    )}

                    {/* Form */}
                    <div className="space-y-6">
                        {/* Google Sheet ID */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                Google Sheet ID *
                            </label>
                            <input
                                type="text"
                                value={googleSheetId}
                                onChange={(e) => setGoogleSheetId(e.target.value)}
                                placeholder="1lU7zRZsWUy6370rnemUgz3VXeHcHWhm8q9Of88YuF90"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Found in your sheet URL: docs.google.com/spreadsheets/d/<strong>SHEET_ID</strong>/edit
                            </p>
                        </div>

                        {/* Service Account Email */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                Service Account Email *
                            </label>
                            <input
                                type="email"
                                value={googleServiceEmail}
                                onChange={(e) => setGoogleServiceEmail(e.target.value)}
                                placeholder="your-service@project.iam.gserviceaccount.com"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-gray-100"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                From your Google Cloud service account JSON file
                            </p>
                        </div>

                        {/* Private Key */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                Private Key *
                            </label>
                            <div className="relative">
                                <textarea
                                    value={googlePrivateKey}
                                    onChange={(e) => setGooglePrivateKey(e.target.value)}
                                    type={showPrivateKey ? 'text' : 'password'}
                                    placeholder="-----BEGIN PRIVATE KEY-----&#10;Your private key here...&#10;-----END PRIVATE KEY-----"
                                    rows={8}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-vertical font-mono text-sm text-gray-900 dark:text-gray-100"
                                    style={{ filter: showPrivateKey ? 'none' : 'blur(3px)' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                                    className="absolute top-3 right-3 p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    {showPrivateKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Paste the entire private key from your service account JSON file
                            </p>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                            <div className="flex gap-3">
                                <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800 dark:text-blue-300">
                                    <p className="font-semibold mb-2">Security Information:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Your credentials are encrypted before being stored</li>
                                        <li>Only you can access your credentials</li>
                                        <li>Your private key is never sent back to the client</li>
                                        <li>You can delete your credentials at any time</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Save Message */}
                        {saveMessage && (
                            <div className={`p-4 rounded-lg ${saveMessageType === 'success'
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-300'
                                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300'
                                }`}>
                                {saveMessage}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className={`flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Save Credentials
                                    </>
                                )}
                            </button>

                            {configured && (
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={20} />
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Setup Guide Link */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Need help? Check out our{' '}
                            <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                Step-by-Step Setup Guide
                            </a>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
