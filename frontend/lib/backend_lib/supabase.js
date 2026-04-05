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

	// Accept modern secret keys (sb_*) or JWT-like service role keys.
	if (value.startsWith('sb_')) return true;

	const jwtLikePattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
	return jwtLikePattern.test(value);
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
			: 'Expected Supabase service role key format (sb_* secret key or JWT-like key with 3 dot-separated parts).'
	};
}

export function getSupabaseBucketName() {
	const bucketName = readEnv('SUPABASE_STORAGE_BUCKET');
	if (!bucketName || isPlaceholder(bucketName)) {
		return 'mystery-bucket';
	}

	return bucketName;
}

export async function ensureSupabaseBucket(supabaseClient) {
	const bucketName = getSupabaseBucketName();
	const { data, error } = await supabaseClient.storage.getBucket(bucketName);

	if (!error && data) {
		return { bucketName, created: false };
	}

	const lookupErrorMessage = String(error?.message || '').toLowerCase();
	const bucketMissing =
		lookupErrorMessage.includes('not found') ||
		lookupErrorMessage.includes('does not exist') ||
		lookupErrorMessage.includes('bucket not found');

	if (!bucketMissing && error) {
		throw new Error(`Storage check failed for bucket "${bucketName}": ${error.message}`);
	}

	const { error: createError } = await supabaseClient.storage.createBucket(bucketName, {
		public: true
	});

	if (createError) {
		const createErrorMessage = String(createError.message || '').toLowerCase();
		if (!createErrorMessage.includes('already exists')) {
			throw new Error(
				`Storage bucket "${bucketName}" is missing and could not be created: ${createError.message}`
			);
		}
	}

	return { bucketName, created: true };
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
