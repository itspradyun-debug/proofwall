const MESSAGES: Record<string, string> = {
  wall_limit_reached: "You've reached the wall limit for your plan. Redeem a code to upgrade.",
  video_limit_reached: 'This business has reached its monthly video limit. You can still leave a written testimonial.',
  rate_limited: 'Too many submissions right now. Please try again in a few minutes.',
  wall_full: 'This page is not accepting new testimonials right now.',
  wall_not_found: 'This testimonial page does not exist.',
  invalid_name: 'Please enter your name (up to 80 characters).',
  invalid_rating: 'Please choose a star rating.',
  body_too_long: 'Your testimonial is too long (2,000 characters maximum).',
  role_too_long: 'Your role or company is too long (80 characters maximum).',
  empty_testimonial: 'Please write something or add a video.',
  invalid_video_path: 'The video could not be attached. Please try again.',
  video_not_found: 'The video upload did not finish. Please try again.',
  invalid_code: 'That code is not valid or was already used.',
  no_upgrade: 'That code would not upgrade your current plan.',
  not_authenticated: 'Please sign in first.',
  'duplicate key value': 'That web address is already taken. Try another.',
  'violates check constraint "walls_slug_check"': 'The web address must be 3-40 characters: lowercase letters, numbers and hyphens.',
  'Invalid login credentials': 'Wrong email or password.',
  'Email not confirmed': 'Please confirm your email first, then sign in.',
  'User already registered': 'An account with this email already exists. Sign in instead.',
};

export function friendly(e: unknown): string {
  const m = (e as { message?: string } | null)?.message || '';
  for (const k of Object.keys(MESSAGES)) {
    if (m.includes(k)) return MESSAGES[k];
  }
  return m || 'Something went wrong. Please try again.';
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function stars(n: number): string {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}
