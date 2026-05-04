
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://paskzwoegduhzehkxoyu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhc2t6d29lZ2R1aHplaGt4b3l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjA0ODksImV4cCI6MjA3NzEzNjQ4OX0.Kyy7bJf1R5MouHNFvOrPbJVYfNADxsciRDXFZZpmd-8'

export const supabase = createClient(supabaseUrl, supabaseKey)
