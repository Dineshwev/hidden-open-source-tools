import { createClient } from '@supabase/supabase-js';

let cachedSupabase = null;

function readEnv(name) {
	const value = process.env[name];
	return typeof value === 'string' ? value.trim() : '';
}

function isPlaceholder(value) {
	if (!value) return true;

	const normalized = value.toLowerCase();
	return normalized === 'undefined' || normalized === 'null' || normalized === 'none';
}

function isValidSupabaseUrl(value) {
	if (isPlaceholder(value)) return false;

	try {
		const parsed = new URL(value);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

function isValidSupabaseKey(value) {
	if (isPlaceholder(value)) return false;

	// Accept any non-placeholder key with reasonable length.
	// This avoids rejecting valid newer formats that don't match older patterns.
	return value.length >= 20;
}

function hasValidSupabaseConfig() {
	const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL');
	const supabaseKey = readEnv('SUPABASE_SERVICE_ROLE_KEY');

	return isValidSupabaseUrl(supabaseUrl) && isValidSupabaseKey(supabaseKey);
}

export function getSupabaseConfigDiagnostics() {
	const supabaseUrl = readEnv('NEXT_PUBLIC_SUPABASE_URL');
	const supabaseKey = readEnv('SUPABASE_SERVICE_ROLE_KEY');

	const urlValid = isValidSupabaseUrl(supabaseUrl);
	const keyValid = isValidSupabaseKey(supabaseKey);

	return {
		urlPresent: !!supabaseUrl,
		urlValid,
		keyPresent: !!supabaseKey,
		keyValid,
		keyHint: keyValid
			? 'Looks valid.'
			: 'Expected a non-placeholder service role key value.'
	};
}

export function getSupabaseClient() {
	if (cachedSupabase) {
		return cachedSupabase;
	}

	if (!hasValidSupabaseConfig()) {
		throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable uploads.');
	}

	cachedSupabase = createClient(
		readEnv('NEXT_PUBLIC_SUPABASE_URL'),
		readEnv('SUPABASE_SERVICE_ROLE_KEY')
	);

	return cachedSupabase;
}

export function hasSupabaseConfig() {
	return hasValidSupabaseConfig();
}
