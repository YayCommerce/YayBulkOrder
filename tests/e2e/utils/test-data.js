/**
 * Test-only user credentials.
 *
 * These match wp-env's own defaults (see @wordpress/env docs) so
 * `global-setup.js` only needs to make sure they exist / have the expected
 * role and password — it never has to invent new credentials. Never point
 * these at a real site; the whole point of wp-env is a disposable Docker
 * instance where a plaintext test password is fine.
 */
export const admin = {
	username: 'admin',
	email: 'admin@example.com',
	password: 'password',
};
