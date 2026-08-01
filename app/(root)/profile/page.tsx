import { getCurrentUserData } from "@/modules/auth/actions";
import UserInfoCard from "@/modules/profile/components/user-info-card";
import React from "react";

const ProfilePage = async () => {
  const profileData = await getCurrentUserData();

  console.log(profileData);
  return (
    <div className="min-h-screen  py-32">
      <div className="container mx-auto px-4 max-w-7xl">
        <UserInfoCard userData={profileData} />
        </div>
      </div>
  );
};

export default ProfilePage;