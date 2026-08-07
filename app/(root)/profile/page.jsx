import { getCurrentUserData } from "@/modules/auth/actions";
import UserInfoCard from "@/modules/profile/components/user-info-card";
import PlaylistSection from "@/modules/profile/components/playlist-section";
import ProfileStats from "@/modules/profile/components/profile-stats";
import SolvedProblems from "@/modules/profile/components/solved-problem";
import SubmissionsHistory from "@/modules/profile/components/submission-history"
import React from "react";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
const ProfilePage = async () => {
  const profileData = await getCurrentUserData();

  // 1. Guard against unauthenticated/missing user data
  if (!profileData) {
    redirect("/sign-in");
  }

  // 2. Extract arrays with safe fallbacks
  const submissions = profileData.submissions || [];
  const solvedProblems = profileData.solvedProblems || [];
  const playlists = profileData.playlists || [];

  return (
    <div className="min-h-screen py-32 bg-slate-50/50 dark:bg-slate-950/50 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-7xl space-y-8">
        {/* User Info Header */}
        <UserInfoCard userData={profileData} />

        {/* Stats Grid */}
        <ProfileStats
          submissions={submissions}
          solvedCount={solvedProblems.length}
          playlistCount={playlists.length}
        />

        {/* Recent Submissions */}
        <SubmissionsHistory submissions={submissions} />

        {/* Solved Problems & Playlists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SolvedProblems solvedProblems={solvedProblems} />
          <PlaylistSection playlists={playlists} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;