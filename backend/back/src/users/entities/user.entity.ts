export interface UserProfile {
  uid: string;
  email: string;
  role: 'employer' | 'worker' | 'admin' | string;
  displayName: string;
  createdAt?: string;
  [key: string]: any;
}
