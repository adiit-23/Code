import Image from "next/image";
import {Button} from "@/components/ui/button";
import { redirect } from 'next/navigation'
import { UserButton } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server';
import { ClerkProvider,Show } from '@clerk/nextjs';
import { onboardUser } from "@/modules/auth/actions";
import {
  Code2,
  Trophy,
  Users,
  Zap,
  ChevronRight,
  Play,
  Star,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


export default async function Home() {
  await onboardUser();
  const { userId } = await auth()
  
  const features = [
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Interactive Coding",
      description:
        "Practice with real-world coding challenges and get instant feedback on your solutions.",
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Track Progress",
      description:
        "Monitor your improvement with detailed analytics and achievement systems.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Global Community",
      description:
        "Learn from thousands of developers worldwide and share your knowledge.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time Feedback",
      description:
        "Get instant feedback on your solutions with detailed explanations.",
    },
  ];

  const stats = [
    { number: "50K+", label: "Problems Solved" },
    { number: "10K+", label: "Active Developers" },
    { number: "25+", label: "Programming Languages" },
    { number: "98%", label: "Success Rate" },
  ];

  const problemCategories = [
    {
      level: "Beginner",
      title: "Easy Problems",
      description:
        "Perfect for getting started with basic programming concepts and syntax.",
      count: "500+ Problems",
      color: "amber",
    },
    {
      level: "Intermediate",
      title: "Medium Problems",
      description:
        "Challenge yourself with data structures and algorithm problems.",
      count: "800+ Problems",
      color: "indigo",
    },
    {
      level: "Advanced",
      title: "Hard Problems",
      description:
        "Master complex algorithms and compete in programming contests.",
      count: "300+ Problems",
      color: "amber",
    },
  ];
  

  return (
    <div className="min-h-screen transition-colors mt-24">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center px-4 pt-16">
        <div className="max-w-6xl mx-auto text-center margin: 0 auto">
          {/* Badge */}
          <Badge
            variant="secondary"
            className="mb-8 bg-rose-100/80 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-200/80 transition-colors rounded-full px-4 py-1.5"
          >
            <Star className="w-4 h-4 mr-2" />
            Join 10,000+ developers already coding
          </Badge>

          {/* Main Heading */}
          <h1 className="text-2xl md:text-5xl lg:text-6xl font-black text-slate-800 dark:text-slate-100 leading-tight mb-8">
            Master{" "}
            <span className="relative inline-block">
              {/* Pastel Pink Block */}
              <span className="px-6 py-3 bg-rose-200 dark:bg-rose-300/90 text-rose-900 rounded-2xl transform -rotate-1 inline-block shadow-lg shadow-rose-200/50">
                Problem
              </span>
            </span>{" "}
            Solving
            <br />
            with{" "}
            <span className="relative inline-block">
              {/* Pastel Indigo/Periwinkle Block */}
              <span className="px-6 py-3 bg-indigo-200 dark:bg-indigo-300/90 text-indigo-900 rounded-2xl transform rotate-1 inline-block shadow-lg shadow-indigo-200/50">
                Code
              </span>
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Challenge yourself with thousands of coding problems, compete with
            developers worldwide, and accelerate your programming journey with
            real-time feedback and expert solutions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              size="lg"
              className="bg-rose-300 hover:bg-rose-400 dark:bg-rose-400 dark:hover:bg-rose-500 text-rose-950 dark:text-rose-950 font-semibold shadow-md shadow-rose-200/50 dark:shadow-rose-900/20 transform hover:-translate-y-0.5 transition-all rounded-full px-8"
            >
              <Play className="w-5 h-5 mr-2 opacity-80" />
              Start Coding Now
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform opacity-80" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full px-8 transition-colors font-semibold"
            >
              Browse Problems
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-700 dark:text-slate-200 mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-500 dark:text-slate-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 bg-slate-50/50 dark:bg-slate-900/20"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-6">
              Everything you need to{" "}
              <span className="text-rose-400 dark:text-rose-300">excel</span>
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Our platform provides comprehensive tools and resources to help
              you become a better programmer
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-xl shadow-slate-200/40 dark:shadow-none transition-all duration-300 border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl"
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 ${
                      index % 2 === 0
                        ? "bg-rose-100 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400"
                        : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400"
                    } rounded-2xl flex items-center justify-center mb-4`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-slate-800 dark:text-slate-200">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Categories */}
      <section id="problems" className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-6">
              Choose your{" "}
              <span className="text-indigo-400 dark:text-indigo-300">
                challenge
              </span>
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              From beginner-friendly puzzles to advanced algorithmic challenges
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {problemCategories.map((category, index) => (
              <Card
                key={index}
                className={`border-2 hover:-translate-y-1 transition-all duration-300 rounded-3xl ${
                  category.color === "amber" || category.color === "orange"
                    ? "bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100 dark:hover:border-rose-800"
                    : "bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100 dark:hover:border-indigo-800"
                }`}
              >
                <CardHeader>
                  <Badge
                    variant="secondary"
                    className={`w-fit rounded-full px-3 py-1 ${
                      category.color === "amber" || category.color === "orange"
                        ? "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300"
                        : "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300"
                    }`}
                  >
                    {category.level}
                  </Badge>
                  <CardTitle className="text-slate-800 dark:text-slate-200 pt-2">
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    {category.description}
                  </CardDescription>
                  <div
                    className={`font-semibold ${
                      category.color === "amber" || category.color === "orange"
                        ? "text-rose-500 dark:text-rose-400"
                        : "text-indigo-500 dark:text-indigo-400"
                    }`}
                  >
                    {category.count}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-rose-200 via-fuchsia-200 to-indigo-200 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-[3rem] mx-4 md:mx-8 mb-12 shadow-xl shadow-rose-200/30 dark:shadow-none dark:border dark:border-slate-800">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 mb-6 tracking-tight">
            Ready to start your coding journey?
          </h2>
          <p className="text-xl text-slate-700 dark:text-slate-300 mb-10 font-medium">
            Join thousands of developers who are improving their skills every
            day
          </p>
          <Button
            size="lg"
            className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-indigo-300 dark:text-indigo-950 dark:hover:bg-indigo-400 shadow-xl rounded-full px-10 py-6 text-lg transition-transform hover:scale-105"
          >
            Get Started for Free
          </Button>
        </div>
      </section>
    </div>
  );
   
}
