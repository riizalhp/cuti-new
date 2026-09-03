/**
 * Employr / AmbilCUTI - Client-side Visitor Tracking Engine
 * Lightweight, zero-dependency visitor tracking SDK
 */

export interface VisitorDeviceInfo {
  device_type: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  browser_version: string;
  os: string;
  screen_resolution: string;
}

export interface TrafficSourceInfo {
  traffic_source: string;
  referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export const APP_DOMAIN_LABELS: Record<string, string> = {
  'employr.id': 'Landing Page',
  'www.employr.id': 'Landing Page',
  'app.employr.id': 'User Dashboard',
  'loker.employr.id': 'Portal Loker',
  'learning.employr.id': 'Learning',
  'faq.employr.id': 'FAQ',
  'masterdata.employr.id': 'Admin Panel',
  'localhost': 'Local Development',
};

export function getAppDomainLabel(hostname: string): string {
  return APP_DOMAIN_LABELS[hostname] || hostname;
}

export interface TrackingPayload {
  action: 'page_view' | 'heartbeat' | 'activity' | 'link_user';
  visitor_id: string;
  session_id: string;
  user_id?: string | null;
  url: string;
  path: string;
  title: string;
  hostname?: string;
  domain?: string;
  device?: VisitorDeviceInfo;
  traffic?: TrafficSourceInfo;
  activity_type?: string;
  activity_name?: string;
  metadata?: Record<string, any>;
  duration_increment_sec?: number;
}

const VISITOR_COOKIE_KEY = 'cuti_visitor_id';
const SESSION_STORAGE_KEY = 'cuti_session_id';
const SESSION_TIMESTAMP_KEY = 'cuti_session_last_active';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let visId = localStorage.getItem(VISITOR_COOKIE_KEY) || getCookie(VISITOR_COOKIE_KEY);
  if (!visId) {
    const rand = Math.random().toString(36).substring(2, 9);
    visId = `vis_${Date.now().toString(36)}_${rand}`;
  }
  localStorage.setItem(VISITOR_COOKIE_KEY, visId);
  setCookie(VISITOR_COOKIE_KEY, visId, 365);
  return visId;
}

export function getOrCreateSessionId(): { sessionId: string; isNew: boolean } {
  if (typeof window === 'undefined') return { sessionId: '', isNew: false };
  const now = Date.now();
  const lastActiveStr = sessionStorage.getItem(SESSION_TIMESTAMP_KEY);
  let sessId = sessionStorage.getItem(SESSION_STORAGE_KEY);
  let isNew = false;

  if (!sessId || !lastActiveStr || now - parseInt(lastActiveStr, 10) > SESSION_TIMEOUT_MS) {
    const rand = Math.random().toString(36).substring(2, 9);
    sessId = `sess_${Date.now().toString(36)}_${rand}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessId);
    isNew = true;
  }

  sessionStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
  return { sessionId: sessId, isNew };
}

export function parseDeviceInfo(): VisitorDeviceInfo {
  if (typeof window === 'undefined') {
    return {
      device_type: 'Desktop',
      browser: 'Unknown',
      browser_version: '',
      os: 'Unknown',
      screen_resolution: '1920x1080',
    };
  }

  const ua = navigator.userAgent;
  let device_type: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    device_type = 'Tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    device_type = 'Mobile';
  }

  // OS Detection
  let os = 'Unknown OS';
  if (/Windows NT 10/i.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
  else if (/Windows NT 6.1/i.test(ua)) os = 'Windows 7';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/CrOS/i.test(ua)) os = 'Chrome OS';

  // Browser Detection
  let browser = 'Unknown Browser';
  let browser_version = '';

  if (/Edg\/([0-9.]+)/i.test(ua)) {
    browser = 'Edge';
    browser_version = RegExp.$1;
  } else if (/OPR\/([0-9.]+)/i.test(ua) || /Opera\/([0-9.]+)/i.test(ua)) {
    browser = 'Opera';
    browser_version = RegExp.$1;
  } else if (/Chrome\/([0-9.]+)/i.test(ua)) {
    browser = 'Chrome';
    browser_version = RegExp.$1;
  } else if (/Safari\/([0-9.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Safari';
    browser_version = RegExp.$1;
  } else if (/Firefox\/([0-9.]+)/i.test(ua)) {
    browser = 'Firefox';
    browser_version = RegExp.$1;
  }

  const screen_resolution = `${window.screen.width}x${window.screen.height}`;

  return {
    device_type,
    browser,
    browser_version,
    os,
    screen_resolution,
  };
}

export function parseTrafficSource(): TrafficSourceInfo {
  if (typeof window === 'undefined') {
    return { traffic_source: 'Direct', referrer: '' };
  }

  const urlParams = new URLSearchParams(window.location.search);
  const utm_source = urlParams.get('utm_source') || undefined;
  const utm_medium = urlParams.get('utm_medium') || undefined;
  const utm_campaign = urlParams.get('utm_campaign') || undefined;
  const utm_content = urlParams.get('utm_content') || undefined;
  const utm_term = urlParams.get('utm_term') || undefined;

  const referrer = document.referrer || '';
  let traffic_source = 'Direct';

  if (utm_source) {
    traffic_source = `Campaign (${utm_source}${utm_medium ? ` / ${utm_medium}` : ''})`;
  } else if (referrer) {
    try {
      const refUrl = new URL(referrer);
      const host = refUrl.hostname.toLowerCase();
      const currentHost = window.location.hostname.toLowerCase();

      if (host === currentHost || host.endsWith('.' + currentHost) || (currentHost.includes('employr.id') && host.includes('employr.id'))) {
        traffic_source = 'Internal Navigation';
      } else if (host.includes('google.')) {
        traffic_source = 'Google Organic';
      } else if (host.includes('bing.') || host.includes('yahoo.') || host.includes('duckduckgo.') || host.includes('ecosia.')) {
        traffic_source = 'Search Engine';
      } else if (host.includes('instagram.com') || host.includes('l.instagram.com')) {
        traffic_source = 'Instagram';
      } else if (host.includes('tiktok.com')) {
        traffic_source = 'TikTok';
      } else if (host.includes('threads.net')) {
        traffic_source = 'Threads';
      } else if (host.includes('facebook.com') || host.includes('fb.com') || host.includes('m.facebook.com')) {
        traffic_source = 'Facebook';
      } else if (host.includes('twitter.com') || host.includes('t.co') || host.includes('x.com')) {
        traffic_source = 'Twitter / X';
      } else if (host.includes('linkedin.com') || host.includes('lnkd.in')) {
        traffic_source = 'LinkedIn';
      } else if (host.includes('whatsapp.com') || host.includes('wa.me') || host.includes('api.whatsapp.com')) {
        traffic_source = 'WhatsApp';
      } else if (host.includes('youtube.com') || host.includes('youtu.be')) {
        traffic_source = 'YouTube';
      } else if (host.includes('telegram.org') || host.includes('t.me')) {
        traffic_source = 'Telegram';
      } else {
        traffic_source = `Referral (${host.replace(/^www\./, '')})`;
      }
    } catch {
      traffic_source = 'Referral (External)';
    }
  }

  return {
    traffic_source,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
  };
}

let apiEndpoint = '/api/track';

export function setTrackingEndpoint(endpoint: string) {
  apiEndpoint = endpoint;
}

export function sendTrackingBeacon(payload: TrackingPayload) {
  if (typeof window === 'undefined') return;

  const bodyStr = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([bodyStr], { type: 'application/json' });
    const success = navigator.sendBeacon(apiEndpoint, blob);
    if (!success) {
      fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
        keepalive: true,
      }).catch(() => {});
    }
  } else {
    fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyStr,
      keepalive: true,
    }).catch(() => {});
  }
}

export function trackPageView(customTitle?: string, userId?: string | null) {
  if (typeof window === 'undefined') return;
  const visitor_id = getOrCreateVisitorId();
  const { sessionId } = getOrCreateSessionId();
  const device = parseDeviceInfo();
  const traffic = parseTrafficSource();
  const hostname = window.location.hostname;
  const domain = hostname.replace(/:\d+$/, '');

  sendTrackingBeacon({
    action: 'page_view',
    visitor_id,
    session_id: sessionId,
    user_id: userId || null,
    url: window.location.href,
    path: window.location.pathname,
    title: customTitle || document.title || window.location.pathname,
    hostname,
    domain,
    device,
    traffic,
  });
}

export function trackHeartbeat(durationSec = 25, userId?: string | null) {
  if (typeof window === 'undefined') return;
  const visitor_id = getOrCreateVisitorId();
  const { sessionId } = getOrCreateSessionId();
  const hostname = window.location.hostname;
  const domain = hostname.replace(/:\d+$/, '');

  sendTrackingBeacon({
    action: 'heartbeat',
    visitor_id,
    session_id: sessionId,
    user_id: userId || null,
    url: window.location.href,
    path: window.location.pathname,
    title: document.title || window.location.pathname,
    hostname,
    domain,
    duration_increment_sec: durationSec,
  });
}

export function trackActivity(
  activity_type: string,
  activity_name: string,
  metadata?: Record<string, any>,
  userId?: string | null
) {
  if (typeof window === 'undefined') return;
  const visitor_id = getOrCreateVisitorId();
  const { sessionId } = getOrCreateSessionId();
  const hostname = window.location.hostname;
  const domain = hostname.replace(/:\d+$/, '');

  sendTrackingBeacon({
    action: 'activity',
    visitor_id,
    session_id: sessionId,
    user_id: userId || null,
    url: window.location.href,
    path: window.location.pathname,
    title: document.title || window.location.pathname,
    hostname,
    domain,
    activity_type,
    activity_name,
    metadata,
  });
}

export function trackLinkUser(userId: string) {
  if (typeof window === 'undefined' || !userId) return;
  const visitor_id = getOrCreateVisitorId();
  const { sessionId } = getOrCreateSessionId();
  const hostname = window.location.hostname;
  const domain = hostname.replace(/:\d+$/, '');

  sendTrackingBeacon({
    action: 'link_user',
    visitor_id,
    session_id: sessionId,
    user_id: userId,
    url: window.location.href,
    path: window.location.pathname,
    title: document.title || window.location.pathname,
    hostname,
    domain,
  });
}
