import { createClient } from '@supabase/supabase-js';

let cachedSupabase = null;

function hasValidSupabaseConfig() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
	const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

	return Boolean(supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) && Boolean(supabaseKey);
}

export function getSupabaseClient() {
	if (cachedSupabase) {
		return cachedSupabase;
	}

	if (!hasValidSupabaseConfig()) {
		throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable uploads.');
	}

	cachedSupabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL,
		process.env.SUPABASE_SERVICE_ROLE_KEY
	);

	return cachedSupabase;
}

export function hasSupabaseConfig() {
	return hasValidSupabaseConfig();
}
