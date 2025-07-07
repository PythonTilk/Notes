import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const workspaceId = parseInt(params.workspaceId);

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { creatorId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        notes: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
        },
      },
    });

    if (!workspace) {
      return new NextResponse("Workspace not found", { status: 404 });
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return new NextResponse("Error fetching workspace", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const workspaceId = parseInt(params.workspaceId);
    const body = await request.json();
    const { name, description, color } = body;

    // Check if user has admin access to this workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { creatorId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id,
                role: { in: ["OWNER", "ADMIN"] },
              },
            },
          },
        ],
      },
    });

    if (!workspace) {
      return new NextResponse("Workspace not found or insufficient permissions", { status: 404 });
    }

    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name: name || workspace.name,
        description: description !== undefined ? description : workspace.description,
        color: color || workspace.color,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            notes: true,
            members: true,
          },
        },
      },
    });

    return NextResponse.json(updatedWorkspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    return new NextResponse("Error updating workspace", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const workspaceId = parseInt(params.workspaceId);

    // Check if user is the owner of this workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        creatorId: session.user.id,
      },
    });

    if (!workspace) {
      return new NextResponse("Workspace not found or insufficient permissions", { status: 404 });
    }

    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return new NextResponse("Workspace deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return new NextResponse("Error deleting workspace", { status: 500 });
  }
}