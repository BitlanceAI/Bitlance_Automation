import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = express.Router();
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.use(authenticateUser);

// GET /api/workspaces — list all workspaces for current user
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, workspaces: data || [] });
});

// POST /api/workspaces — create new workspace
router.post('/', async (req, res) => {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Workspace name is required' });

    const { data, error } = await supabase
        .from('workspaces')
        .insert({ user_id: req.user.id, name: name.trim() })
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, workspace: data });
});

// PUT /api/workspaces/:id — rename workspace
router.put('/:id', async (req, res) => {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

    const { data, error } = await supabase
        .from('workspaces')
        .update({ name: name.trim(), updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('user_id', req.user.id)
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, workspace: data });
});

// DELETE /api/workspaces/:id — delete workspace
router.delete('/:id', async (req, res) => {
    const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', req.user.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

export default router;
