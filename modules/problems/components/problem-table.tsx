"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bookmark,
  TrashIcon,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import AddToPlaylistModal from "./add-to-playlist";
import CreatePlaylistModal from "./create-playlist";
import {
  deleteProblem,
} from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type DifficultyOption = "EASY" | "MEDIUM" | "HARD";
type DifficultyFilter = DifficultyOption | "ALL";
type TagFilter = string | "ALL";

interface Problem {
  id: string;
  title: string;
  tags?: string[];
  difficulty: DifficultyOption;
  solvedBy: any[];
}

interface User {
  role?: string;
}

interface ProblemsTableProps {
  problems?: Problem[];
  user?: User;
}

const ProblemsTable = ({ problems, user }: ProblemsTableProps) => {
  const [search, setSearch] = useState<string>("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("ALL");
  const [selectedTag, setSelectedTag] = useState<TagFilter>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] =
    useState<boolean>(false);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

  // Extract all unique tags from problems
  const allTags = useMemo(() => {
    if (!Array.isArray(problems)) return [];
    const tagsSet = new Set();
    problems.forEach((p) => p.tags?.forEach((t: any) => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [problems]);

  // Define allowed difficulties
  const difficulties = ["EASY", "MEDIUM", "HARD"];

  // Filter problems based on search, difficulty, and tags
  const filteredProblems = useMemo(() => {
    const safeProblems = Array.isArray(problems) ? problems : [];

    return safeProblems
      .filter((problem) =>
        problem.title.toLowerCase().includes(search.toLowerCase())
      )
      .filter((problem) =>
        difficulty === "ALL" ? true : problem.difficulty === difficulty
      )
      .filter((problem) =>
        selectedTag === "ALL" ? true : problem.tags?.includes(selectedTag)
      );
  }, [problems, search, difficulty, selectedTag]);

  // Pagination logic
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const paginatedProblems = useMemo(() => {
    return filteredProblems.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredProblems, currentPage]);

  const handleDelete = async (id: string) => {
    const result = await deleteProblem(id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }
  };

  const handleCreatePlaylist = async (data: any) => {
    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsCreateModalOpen(false);
        toast.success("Playlist created successfully");
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      console.error("Error creating playlist:", error);
      const message = error instanceof Error ? error.message : "Failed to create playlist";
      toast.error(message);
    }
  };

  const handleAddToPlaylist = async (problemId: string, playlistId: string) => {
    try {
      const response = await fetch("/api/playlists/add-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, playlistId }),
      });

      const result = await response.json();

      if (result.success) {
        setIsAddToPlaylistModalOpen(false);
        toast.success("Problem added to playlist");
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      console.error("Error adding to playlist:", error);
      const message = error instanceof Error ? error.message : "Failed to add problem to playlist";
      toast.error(message);
    }
  };

  const handleRemoveFromPlaylist = async (problemId: string, playlistId: string) => {
    try {
      const response = await fetch("/api/playlists/remove-problem", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, playlistId }),
      });

      const result = await response.json();

      if (result.success) {
        setIsAddToPlaylistModalOpen(false);
        toast.success("Problem removed from playlist");
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      console.error("Error removing from playlist:", error);
      const message = error instanceof Error ? error.message : "Failed to remove problem from playlist";
      toast.error(message);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
      case "MEDIUM":
        return "bg-amber-100/80 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";
      case "HARD":
        return "bg-rose-100/80 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800/50";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-6 pt-24 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Problems</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage and solve coding problems
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-sm"
        >
          <Plus className="h-4 w-4 pointer-events-none" />
          Create Playlist
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Filter className="h-5 w-5" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Filters</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-indigo-500 rounded-lg"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                value={difficulty}
                onValueChange={(value) => setDifficulty(value as DifficultyFilter)}
              >
                <SelectTrigger className="w-[180px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Difficulties</SelectItem>
                  {difficulties.map((diff) => (
                    <SelectItem key={diff} value={diff}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedTag}
                onValueChange={(value) => setSelectedTag(value as TagFilter)}
              >
                <SelectTrigger className="w-[180px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                  <SelectValue placeholder="Select tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Tags</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag as string} value={tag as string}>
                      {tag as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-200/70 dark:border-slate-800">
              <TableRow>
                <TableHead className="w-[100px] text-slate-500 dark:text-slate-400">Solved</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Title</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400">Tags</TableHead>
                <TableHead className="w-[120px] text-slate-500 dark:text-slate-400">Difficulty</TableHead>
                <TableHead className="w-[200px] text-slate-500 dark:text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProblems.length > 0 ? (
                paginatedProblems.map((problem) => {
                  const isSolved = problem.solvedBy.length > 0;
                  const isInPlaylist =
                    Array.isArray((problem as any).problemsPlaylists) &&
                    (problem as any).problemsPlaylists.length > 0;
                  return (
                    <TableRow
                      key={problem.id}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSolved}
                          disabled
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 dark:data-[state=checked]:bg-emerald-500"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={`/problem/${problem.id}`}
                          className="text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          {problem.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(problem.tags || []).map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/30"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getDifficultyColor(
                            problem.difficulty
                          )} font-medium px-2.5 py-0.5 rounded-full border`}
                        >
                          {problem.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user?.role === "ADMIN" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(problem.id)}
                              className="rounded-lg bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-600 dark:hover:bg-rose-700"
                            >
                              <TrashIcon className="h-4 w-4 pointer-events-none" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProblemId(problem.id);
                              setIsAddToPlaylistModalOpen(true);
                            }}
                            className="gap-2 rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Bookmark
                              className="h-4 w-4"
                              fill={isInPlaylist ? "currentColor" : "none"}
                              color="currentColor"
                            />
                            {isInPlaylist ? "Saved" : "Save"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-slate-500 dark:text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-slate-400" />
                      <p>No problems found matching your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <p className="text-sm">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredProblems.length)} of{" "}
            {filteredProblems.length} problems
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="rounded-lg border-slate-200 dark:border-slate-800"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="rounded-lg border-slate-200 dark:border-slate-800"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePlaylist}
      />

      <AddToPlaylistModal
        isOpen={isAddToPlaylistModalOpen}
        onClose={() => setIsAddToPlaylistModalOpen(false)}
        onSubmit={handleAddToPlaylist}
        onRemove={handleRemoveFromPlaylist}
        problemId={selectedProblemId}
      />
    </div>
  );
};

export default ProblemsTable;