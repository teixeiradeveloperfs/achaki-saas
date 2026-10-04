/** Every permission the API knows about. The seed keeps the database in sync with this catalog. */
export const PERMISSIONS = {
  'admin:access': 'Acessar o painel administrativo',
  'users:read': 'Ver usuários',
  'users:write': 'Criar, editar e bloquear usuários',
  'roles:manage': 'Gerenciar papéis e permissões',
  'audit:read': 'Ver o registro de auditoria',
  'integrations:manage': 'Configurar integrações e credenciais da plataforma',
  'offers:read': 'Ver as ofertas coletadas pela plataforma e pelos usuários',
  'offers:sync': 'Executar a coleta manual de ofertas padrão',
} as const;

export type Permission = keyof typeof PERMISSIONS;

const ALL = Object.keys(PERMISSIONS) as Permission[];

/** Built-in roles. Users can hold several; their permissions are the union. */
export const ROLES: Record<string, { name: string; permissions: Permission[] }> = {
  super_admin: { name: 'Super admin', permissions: ALL },
  admin: {
    name: 'Admin',
    permissions: ['admin:access', 'users:read', 'users:write', 'audit:read', 'integrations:manage', 'offers:read', 'offers:sync'],
  },
  support: { name: 'Suporte', permissions: ['admin:access', 'users:read'] },
};
