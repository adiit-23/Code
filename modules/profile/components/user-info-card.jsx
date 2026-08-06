import React from 'react';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
export const dynamic = "force-dynamic";
const UserInfoCard = ({ userData }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  if (!userData) {
    // You can return null, an error message, or a loading skeleton here.
    return (
      <Card className="mb-8 p-8 h-48 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-[2rem]">
        <p className="text-slate-500">No user profile data available.</p>
      </Card>
    );
  }

  // 2. Safely generate initials (Defaults to "U" for User if both names are missing)
  const initials = (userData.firstName?.[0] || "") + (userData.lastName?.[0] || "") || "U";
  
  // 3. Safely fallback names to avoid weird empty spaces
  const displayName = `${userData.firstName || "Unknown"} ${userData.lastName || "User"}`.trim();

  return (
    <Card className="mb-8 border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-none transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none">
      <CardContent className="p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* Avatar Section */}
          <div className="relative">
            <Avatar className="w-28 h-28 border-4 border-rose-100 dark:border-rose-900/30 shadow-lg shadow-rose-100/50 dark:shadow-none">
              <AvatarImage 
                src={userData.imageUrl} 
                alt={displayName}
              />
              <AvatarFallback className="text-3xl font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400">
                {/* Use our safely computed initials here */}
                {initials}
              </AvatarFallback>
            </Avatar>
            
           {/* Soft Pastel Indigo Shield - ONLY SHOW FOR ADMINS */}
            {userData.role === 'ADMIN' && (
            <div className="absolute -bottom-1 -right-1 bg-indigo-400 dark:bg-indigo-500/90 rounded-full p-2.5 shadow-md shadow-indigo-200/50 dark:shadow-none">
                <Shield className="w-5 h-5 text-white" />
            </div>
            )}
          </div>
          
          {/* Info Section */}
          <div className="flex-1 text-center md:text-left mt-2 md:mt-0">
            <h1 className="text-3xl md:text-4xl font-black mb-3 text-slate-800 dark:text-slate-100 tracking-tight">
              {/* Use the safe display name here */}
              {displayName}
            </h1>
            
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-6">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <Mail className="w-4 h-4 text-rose-400 dark:text-rose-500" />
                <span className="text-sm md:text-base">{userData.email || "No email provided"}</span>
              </div>
              
              <Badge 
                variant="outline" 
                className={`rounded-full px-4 py-1 border-none ${
                  userData.role === 'ADMIN' 
                    ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300' 
                    : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300'
                }`}
              >
                {userData.role || "USER"}
              </Badge>
            </div>
            
            {/* Make sure formatDate handles undefined dates inside its own function! */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 w-fit mx-auto md:mx-0 px-5 py-3 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-indigo-400 dark:text-indigo-500" />
                <span>Joined {userData.createdAt ? formatDate(userData.createdAt) : "Unknown"}</span>
              </div>
              <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-indigo-400 dark:text-indigo-500" />
                <span>Active {userData.updateAt ? formatDate(userData.updateAt) : "Unknown"}</span>
              </div>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfoCard;