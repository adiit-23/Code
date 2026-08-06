import React from 'react';
import { List, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = "force-dynamic";

const PlaylistsSection = ({ playlists }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="w-full border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm transition-colors duration-300">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <List className="w-5 h-5" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Playlists
          </CardTitle>
          <Badge className="bg-indigo-100/80 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 font-medium px-2.5 py-0.5 rounded-full">
            {playlists.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {playlists.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <List className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
              No Playlists Created
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create your first playlist to organize your problems!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <Card
                key={playlist.id}
                className="border-slate-200/60 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-950/50 hover:border-indigo-200 dark:hover:border-indigo-900/60 hover:shadow-md transition-all duration-200 rounded-xl group overflow-hidden"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-indigo-100/80 dark:bg-indigo-950/80 border border-indigo-200/50 dark:border-indigo-800/50 rounded-xl p-2.5 group-hover:bg-indigo-200/80 dark:group-hover:bg-indigo-900/80 transition-colors">
                      <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {playlist.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {playlist.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-3 space-y-1 mt-auto">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                      <Calendar className="w-3 h-3 text-indigo-500/70" />
                      <span>Created {formatDate(playlist.createdAt)}</span>
                    </div>
                    {playlist.createdAt !== playlist.updatedAt && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                        <Calendar className="w-3 h-3 text-indigo-500/70" />
                        <span>Updated {formatDate(playlist.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaylistsSection;