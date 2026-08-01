import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const { problemId, playlistId } = await request.json();

    if (!problemId || !playlistId) {
      return NextResponse.json(
        { success: false, error: "Problem ID and playlist ID are required" },
        { status: 400 }
      );
    }

    // Verify playlist belongs to user to prevent unauthorized deletions
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId: dbUser.id,
      },
    });

    if (!playlist) {
      return NextResponse.json(
        { success: false, error: "Playlist not found or unauthorized" },
        { status: 404 }
      );
    }

    // Remove problem from playlist
    // We use deleteMany here as it safely targets the exact pair without 
    // needing to specify a named compound unique identifier index.
    await prisma.problemInPlaylist.deleteMany({
      where: {
        problemId: problemId,
        playlistId: playlistId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Problem removed from playlist successfully",
    });
    
  } catch (error) {
    console.error("Error removing problem from playlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove problem from playlist" },
      { status: 500 }
    );
  }
}