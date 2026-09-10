// In production, Vercel proxies this same-origin path to the backend. This
// keeps the HttpOnly auth cookie first-party. Local development still uses the
// configured API URL (or the existing localhost fallback).
const API_BASE_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL?.startsWith("/") ? import.meta.env.VITE_API_URL : "/api/v1")
  : (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1");
export const USER_API_END_POINT=`${API_BASE_URL}/user`;
export const JOB_API_END_POINT=`${API_BASE_URL}/job`;
export const APPLICATION_API_END_POINT=`${API_BASE_URL}/application`;
export const COMPANY_API_END_POINT=`${API_BASE_URL}/company`;
export const API_END_POINT=API_BASE_URL;
