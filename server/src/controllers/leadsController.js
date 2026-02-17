import { supabase } from '../config/supabaseClient.js';

export const createLead = async (req, res) => {
    try {
        const { name, email, phone, businessName, revenue, goals } = req.body;
        console.log('Received lead:', req.body);

        // precise columns based on standard conventions, user can adjust if DB schema differs
        const { data, error } = await supabase
            .from('leads')
            .insert([
                {
                    name,
                    email,
                    phone,
                    business_name: businessName,
                    revenue,
                    goals,
                    created_at: new Date()
                }
            ])
            .select();

        if (error) {
            console.error('Error inserting lead:', error);
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json({ message: 'Lead created successfully', data });
    } catch (error) {
        console.error('Server error creating lead:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
