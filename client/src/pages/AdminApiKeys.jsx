import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/landing/Footer';

export default function AdminApiKeys() {
  const { session } = useAuth();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('growth');
  const [label, setLabel] = useState('');
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState(null);

  const apiUrl = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    if (!session?.access_token) return;
    try {
      const response = await axios.get(`${apiUrl}/api/v1/admin/api-keys/list`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setKeys(response.data.keys || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Client email is required");
    
    setGenerating(true);
    setNewKey(null);
    try {
      const response = await axios.post(`${apiUrl}/api/v1/admin/api-keys/create`, {
        client_email: email,
        plan: plan,
        label: label
      }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      
      setNewKey(response.data.api_key);
      toast.success("Key generated successfully!");
      fetchKeys();
      setEmail('');
      setLabel('');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Failed to generate key');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (keyId) => {
    if (!window.confirm("Are you sure you want to revoke this key?")) return;
    try {
      await axios.post(`${apiUrl}/api/v1/admin/api-keys/revoke`, { key_id: keyId }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      toast.success("Key revoked!");
      fetchKeys();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || 'Failed to revoke key');
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">API Key Manager</h1>
            <p className="mt-2 text-sm text-gray-600">
              Provision and manage API access for your enterprise partners.
            </p>
          </div>

          {/* Generator Form */}
          <div className="bg-white rounded-lg shadow px-6 py-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Provision New Client Key</h2>
            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client Email (Supabase User)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@lotlite.com"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Client/Brand Name</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Lotlite Edu"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                >
                  <option value="starter">Starter (10/min)</option>
                  <option value="growth">Growth (30/min)</option>
                  <option value="agency">Agency (60/min)</option>
                  <option value="enterprise">Enterprise (120/min)</option>
                </select>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={generating}
                  className="w-full bg-teal-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  {generating ? "Generating..." : "Create API Key"}
                </button>
              </div>
            </form>

            {newKey && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="text-sm font-bold text-green-800">Success! Key Generated.</h3>
                <p className="text-sm text-green-700 mt-1 mb-2">
                  Send this key to your client. You will not be able to see it again.
                </p>
                <code className="block w-full bg-white border border-green-300 rounded p-2 text-sm font-mono break-all text-gray-900">
                  {newKey}
                </code>
              </div>
            )}
          </div>

          {/* Key List */}
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-bold text-gray-900">Active API Keys</h3>
            </div>
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading...</div>
            ) : keys.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">No API keys found.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {keys.map((k) => (
                  <li key={k.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-gray-900 mr-2">{k.label || 'Unnamed Client'}</span>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                          {k.plan.toUpperCase()}
                        </span>
                        {k.status !== 'active' && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {k.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        Prefix: <code className="bg-gray-100 px-1 rounded">{k.prefix}...</code>
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        Created: {new Date(k.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      {k.status === 'active' && (
                        <button
                          onClick={() => handleRevoke(k.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
