"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedChecker } from "@/components/admin/feed-checker";
import { StreamChecker } from "@/components/admin/stream-checker";
import { VideoChecker } from "@/components/admin/video-checker";
import { Rss, AudioLines, SquarePlay } from "lucide-react";

const TABS = ["feed", "stream", "video"] as const;
type Tab = (typeof TABS)[number];

export function CekUrlTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const activeTab: Tab = TABS.includes(tab as Tab) ? (tab as Tab) : "feed";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Tabs value={activeTab} onValueChange={handleChange}>
      <TabsList variant="line" className="gap-1 border-b border-border p-0">
        <TabsTrigger
          value="feed"
          className="gap-1.5 rounded-none border-0 px-3 py-2 text-muted-foreground data-active:bg-transparent data-active:text-brass data-active:shadow-none after:bg-brass!"
        >
          <Rss className="h-3.5 w-3.5" />
          Feed Berita
        </TabsTrigger>
        <TabsTrigger
          value="stream"
          className="gap-1.5 rounded-none border-0 px-3 py-2 text-muted-foreground data-active:bg-transparent data-active:text-brass data-active:shadow-none after:bg-brass!"
        >
          <AudioLines className="h-3.5 w-3.5" />
          Stream Radio
        </TabsTrigger>
        <TabsTrigger
          value="video"
          className="gap-1.5 rounded-none border-0 px-3 py-2 text-muted-foreground data-active:bg-transparent data-active:text-brass data-active:shadow-none after:bg-brass!"
        >
          <SquarePlay className="h-3.5 w-3.5" />
          Video YouTube
        </TabsTrigger>
      </TabsList>

      <TabsContent value="feed" className="pt-5">
        <FeedChecker />
      </TabsContent>
      <TabsContent value="stream" className="pt-5">
        <StreamChecker />
      </TabsContent>
      <TabsContent value="video" className="pt-5">
        <VideoChecker />
      </TabsContent>
    </Tabs>
  );
}
