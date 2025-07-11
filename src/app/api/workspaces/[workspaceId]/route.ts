import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = parseInt(params.workspaceId);
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { creator: true, members: { include: { user: true } }, notes: true },
    });

    if (!workspace) {
      return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
    }

    // Check if the user is a member or creator of the workspace
    const isMember = workspace.members.some(
      (member) => member.userId === parseInt(session.user.id as string)
    );
    const isCreator = workspace.creatorId === parseInt(session.user.id as string);

    if (!isMember && !isCreator) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = parseInt(params.workspaceId);
    const { name, description, color } = await request.json();

    const existingWorkspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!existingWorkspace) {
      return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
    }

    // Check if the user is an owner or admin of the workspace
    const userMembership = existingWorkspace.members.find(
      (member) => member.userId === parseInt(session.user.id as string)
    );

    if (
      !userMembership ||
      (userMembership.role !== "OWNER" && userMembership.role !== "ADMIN")
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name, description, color },
    });

    return NextResponse.json(updatedWorkspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = parseInt(params.workspaceId);

    const existingWorkspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!existingWorkspace) {
      return NextResponse.json({ message: "Workspace not found" }, { status: 404 });
    }

    // Only the owner can delete the workspace
    const userMembership = existingWorkspace.members.find(
      (member) => member.userId === parseInt(session.user.id as string)
    );

    if (!userMembership || userMembership.role !== "OWNER") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return NextResponse.json({ message: "Workspace deleted successfully" }, { status: 204 });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: (error as Error).message },
      { status: 500 }
    );
  }
}
