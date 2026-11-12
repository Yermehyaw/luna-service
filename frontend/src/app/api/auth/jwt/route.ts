import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { auth } from '../../../../lib/better-auth';

const BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ||
  'luna_secret_auth_key_2026_super_secure_multi_tenant';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let { sub, email, name, role, tenantId, privileges } = body;

    // Check if there is an active Better-Auth session in cookies/headers
    try {
      const session = await auth.api.getSession({
        headers: req.headers,
      });
      if (session?.user) {
        sub = sub || session.user.id;
        email = email || session.user.email;
        name = name || session.user.name;
        const u = session.user as any;
        role = role || u.role;
        tenantId = tenantId || u.tenantId;
        privileges = privileges || u.privileges;
      }
    } catch {
      // Fall through to body claims
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required to mint authentication JWT' },
        { status: 400 }
      );
    }

    const resolvedSub = sub || `usr_${Buffer.from(email).toString('hex').slice(0, 16)}`;
    const resolvedRole = role || 'customer';
    const resolvedTenant = tenantId || 'kemis-lounge';

    let resolvedPrivileges = privileges;
    if (typeof resolvedPrivileges === 'string') {
      try {
        resolvedPrivileges = JSON.parse(resolvedPrivileges);
      } catch {
        resolvedPrivileges = [resolvedPrivileges];
      }
    }
    if (!resolvedPrivileges) {
      resolvedPrivileges =
        resolvedRole === 'tenant_admin'
          ? [
              'ops_console',
              'customer_directory',
              'approve_documents',
              'manage_services',
              'manage_branches',
              'view_analytics',
              'social_studio',
            ]
          : resolvedRole === 'staff'
          ? ['ops_console', 'customer_directory']
          : [];
    }

    const secretKey = new TextEncoder().encode(BETTER_AUTH_SECRET);
    const token = await new SignJWT({
      sub: resolvedSub,
      email,
      name: name || email.split('@')[0],
      role: resolvedRole,
      tenantId: resolvedTenant,
      privileges: resolvedPrivileges,
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secretKey);

    return NextResponse.json({
      token,
      user: {
        id: resolvedSub,
        email,
        name: name || email.split('@')[0],
        role: resolvedRole,
        tenantId: resolvedTenant,
        privileges: resolvedPrivileges,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to issue JWT token', detail: err.message },
      { status: 500 }
    );
  }
}
