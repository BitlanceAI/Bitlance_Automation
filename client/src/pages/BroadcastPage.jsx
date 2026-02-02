import React from 'react';
import BroadcastForm from '../components/BroadcastForm';
import Navbar from '../components/Navbar';

const BroadcastPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
            <Navbar />
            <div className="max-w-4xl mx-auto">

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Broadcast Console
                    </h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Send broadcast messages to your audience.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-50">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Send Message</h2>
                        <p className="mt-2 text-gray-500">Enter details below to send a message.</p>
                    </div>
                    <BroadcastForm />
                </div>
            </div>
        </div>
    );
};

export default BroadcastPage;
