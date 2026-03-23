export class User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  avatarUrl?: string;
  provider?: string;
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
}
