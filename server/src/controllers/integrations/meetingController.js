import { supabase } from '../../config/supabaseClient.js';

export const getMeetings = async (req, res) => {
    try {
        const { start_date, end_date, status } = req.query;
        let query = supabase.from('meetings').select('*').order('scheduled_date', { ascending: true });

        if (start_date) query = query.gte('scheduled_date', start_date);
        if (end_date) query = query.lte('scheduled_date', end_date);
        if (status) query = query.eq('status', status);

        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('meetings')
            .update(req.body)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
