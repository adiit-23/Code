import { getCurrentUserData } from "@/modules/auth/actions";
import UserInfoCard from "@/modules/profile/components/user-info-card";
import PlaylistsSection from "@/modules/profile/components/playlist-section";
import ProfileStats from "@/modules/profile/components/profile-stats";
import SolvedProblems from "@/modules/profile/components/solved-problem";
import SubmissionsHistory from "@/modules/profile/components/submission-history"
import UserStatsChart from "@/modules/profile/components/user-stats-chart";
import React from "react";

const ProfilePage = async () => {
  const profileData = await getCurrentUserData();

  console.log(profileData);
  return (
    <div className="min-h-screen  py-32">
      <div className="container mx-auto px-4 max-w-7xl">
        <UserInfoCard userData={profileData} />
        <ProfileStats
          submissions={profileData.submissions}
          solvedCount={profileData.solvedProblems.length}
          playlistCount={profileData.playlists.length}
        />

      
      <UserStatsChart 
        easy={42} 
        medium={18} 
        hard={5} 
        streak={12} 
      />
      
  
        <SubmissionsHistory submissions={profileData.submissions} />

        <div className="grid  gap-8">
          <SolvedProblems solvedProblems={profileData.solvedProblems} />
          <PlaylistsSection playlists={profileData.playlists} />
        </div>
        </div>
      </div>
  );
};

export default ProfilePage;