import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';
import { toast } from 'react-hot-toast';

const IntegrationCodePanel = () => {
    const [copied, setCopied] = useState(null);

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopied(id);
        toast.success('Code copied!');
        setTimeout(() => setCopied(null), 2000);
    };

    const snippetAndroid = `
// Kotlin - FirebaseMessagingService

class MyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        sendRegistrationToServer(token)
    }

    private fun sendRegistrationToServer(token: String) {
        val url = "https://your-api.com/api/push/tokens/register"
        // Use OkHttp or Retrofit to POST { "token": token, "platform": "android" }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        if (remoteMessage.data.isNotEmpty()) {
            Log.d(TAG, "Message data payload: " + remoteMessage.data)
        }
        remoteMessage.notification?.let {
            Log.d(TAG, "Message Notification Body: " + it.body)
        }
    }
}`;

    const snippetIOS = `
// Swift - AppDelegate.swift

func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    let tokenParts = deviceToken.map { data in String(format: "%02.2hhx", data) }
    let token = tokenParts.joined()
    registerToken(token: token)
}

func registerToken(token: String) {
    let url = URL(string: "https://your-api.com/api/push/tokens/register")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    let body = ["token": token, "platform": "ios"]
    request.httpBody = try? JSONSerialization.data(withJSONObject: body)
    URLSession.shared.dataTask(with: request).resume()
}`;

    const snippetNode = `
// Node.js - Backend Token Storage (Example)

app.post('/api/push/tokens/register', async (req, res) => {
    const { token, platform } = req.body;
    await firestore.collection('device_tokens').doc(token).set({
        token,
        platform,
        isActive: true,
        lastUpdated: new Date()
    }, { merge: true });
    res.json({ success: true });
});`;

    const snippets = [
        { id: 'android', title: 'Android (Kotlin)', code: snippetAndroid },
        { id: 'ios', title: 'iOS (Swift)', code: snippetIOS },
        { id: 'node', title: 'Node.js Backend', code: snippetNode },
    ];

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Integration Guide</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Copy these snippets to integrate push notifications in your mobile apps</p>
            </div>
            <div className="grid gap-8">
                {snippets.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Code className="w-5 h-5 text-indigo-600" /> {item.title}
                            </h3>
                            <button onClick={() => handleCopy(item.code, item.id)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                                {copied === item.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                {copied === item.id ? 'Copied' : 'Copy Code'}
                            </button>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <pre className="p-6 text-sm font-mono text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-slate-900 min-w-full">{item.code}</pre>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IntegrationCodePanel;
