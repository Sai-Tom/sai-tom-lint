// ユーザーサービスのサンプル

interface User {
  id    : number;
  name  : string;
  email : string;
  role  : string;
}

export class UserService {
  private users: User[] = [];
  private nextId        = 1;

  // ユーザーの作成
  createUser(name: string, email: string, role: string): User {
    const id   = this.nextId++;
    const user = { id, name, email, role };
    
    this.users.push(user);
    return user;
  }

  // 設定値の例
  private config = {
    maxUsers    : 1000,
    defaultRole : 'user',
    adminEmail  : 'admin@example.com'
  };

  // 定数の定義
  static readonly STATUS_ACTIVE   = 'active';
  static readonly STATUS_INACTIVE = 'inactive';
  static readonly STATUS_PENDING  = 'pending';
} 