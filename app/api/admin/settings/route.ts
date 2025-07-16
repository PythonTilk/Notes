import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { headers } from 'next/headers';

const updateSettingsSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().optional(),
  backupSchedule: z.string().regex(/^[0-9\s\*\/\-\,]+$/).optional(), // Cron expression validation
  maxFileSize: z.number().min(1024).max(104857600).optional(), // 1KB to 100MB
  allowedFileTypes: z.array(z.string()).optional(),
  maxWorkspacesPerUser: z.number().min(1).max(100).optional(),
  maxNotesPerWorkspace: z.number().min(10).max(10000).optional(),
  chatRetentionDays: z.number().min(1).max(365).optional(),
  trashRetentionHours: z.number().min(1).max(168).optional(), // Max 1 week
});

async function checkAdminAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === 'ADMIN';
}

async function logAuditAction(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: any,
  request?: NextRequest
) {
  const headersList = headers();
  const ipAddress = headersList.get('x-forwarded-for') || 
                   headersList.get('x-real-ip') || 
                   'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkAdminAccess(session.user.id);
    if (!isAdmin) {
      await logAuditAction(
        session.user.id,
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        'system_settings',
        undefined,
        { endpoint: '/api/admin/settings' },
        request
      );
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get or create system settings
    let settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {}, // Will use default values from schema
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkAdminAccess(session.user.id);
    if (!isAdmin) {
      await logAuditAction(
        session.user.id,
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        'system_settings',
        undefined,
        { endpoint: '/api/admin/settings', method: 'PUT' },
        request
      );
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateSettingsSchema.parse(body);

    // Get or create system settings
    let settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: validatedData,
      });
    } else {
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: validatedData,
      });
    }

    // Log the changes
    await logAuditAction(
      session.user.id,
      'SYSTEM_SETTINGS_UPDATED',
      'system_settings',
      settings.id,
      { changes: validatedData },
      request
    );

    // Create activity
    await prisma.activity.create({
      data: {
        type: 'SYSTEM_SETTINGS_UPDATED',
        title: 'System Settings Updated',
        description: `Updated system settings`,
        userId: session.user.id,
      },
    });

    // If maintenance mode was toggled, log it separately
    if (validatedData.maintenanceMode !== undefined) {
      await prisma.activity.create({
        data: {
          type: 'MAINTENANCE_MODE_TOGGLED',
          title: 'Maintenance Mode Toggled',
          description: `Maintenance mode ${validatedData.maintenanceMode ? 'enabled' : 'disabled'}`,
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating system settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}