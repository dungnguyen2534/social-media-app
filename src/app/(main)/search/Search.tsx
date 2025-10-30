"use client";

import InfiniteScrollContainer from "@/components/common/InfiniteScrollContainer";
import LoadingButton from "@/components/common/LoadingButton";
import FeedSkeletons from "@/components/feeds/FeedSkeletons";
import Post from "@/components/posts/Post";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchIcon, TextSearch, UserRoundSearch } from "lucide-react";
import React, { useState } from "react";
import UserResult from "./UserResult";
import NotificationSkeletons from "../notifications/NotificationSkeletons";
import { useSearchPosts } from "./useSearchPosts";
import { useSearchUsers } from "./useSearchUsers";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const {
    users,
    isFetchingFirstUsersPage,
    isUsersFetched,
    fetchNextUsersPage,
    hasNextUsersPage,
    isFetchingNextUsersPage,
    isFetchingUsersPage,
  } = useSearchUsers(searchQuery);

  const {
    posts,
    isFetchingFirstPostsPage,
    isPostsFetched,
    fetchNextPostPage,
    hasNextPostsPage,
    isFetchingNextPostsPage,
    isFetchingPostsPage,
  } = useSearchPosts(searchQuery);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedSearchTerm = searchTerm.trim();
    if (!trimmedSearchTerm) return;

    if (trimmedSearchTerm !== searchQuery) {
      setSearchQuery(trimmedSearchTerm);
      setHasSearched(true);
    }
  };

  const activeQueryIsLoading =
    isFetchingFirstUsersPage || isFetchingFirstPostsPage;

  return (
    <div>
      <Tabs defaultValue="users" className="gap-1 lg:gap-2">
        <TabsList className="rounded-none lg:rounded-md">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>

        <div className="bg-card p-2 shadow-sm lg:rounded-md">
          <form
            onSubmit={handleSubmit}
            className="bg-accent dark:bg-background flex gap-1 rounded-sm p-1 shadow-inner transition-all"
          >
            <Input
              className="bg-accent dark:bg-background border-none pe-0 shadow-none focus-visible:ring-0"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <LoadingButton
              loading={activeQueryIsLoading}
              className="text-muted-foreground hover:!bg-card w-10 rounded-sm"
              type="submit"
              variant="ghost"
            >
              <SearchIcon className="size-5" />
            </LoadingButton>
          </form>
        </div>

        <TabsContent value="users">
          <InfiniteScrollContainer
            onBottomReached={() =>
              hasNextUsersPage && !isFetchingUsersPage && fetchNextUsersPage()
            }
          >
            {!hasSearched && !isUsersFetched && (
              <div className="text-muted-foreground mt-24 flex flex-col items-center justify-center text-center">
                <UserRoundSearch className="mb-2 size-24" />
              </div>
            )}

            {isFetchingFirstUsersPage && <NotificationSkeletons count={3} />}
            {!isFetchingFirstUsersPage &&
              isUsersFetched &&
              users.length === 0 && (
                <div className="text-muted-foreground mt-24 flex flex-col items-center justify-center text-center">
                  <UserRoundSearch className="mb-2 size-24" />
                  <div className="text-lg">No users found.</div>
                </div>
              )}

            {users?.map((user) => (
              <UserResult user={user} key={user.id} />
            ))}

            {isFetchingNextUsersPage && <NotificationSkeletons count={1} />}
          </InfiniteScrollContainer>
        </TabsContent>

        <TabsContent value="posts">
          <InfiniteScrollContainer
            onBottomReached={() =>
              hasNextPostsPage && !isFetchingPostsPage && fetchNextPostPage()
            }
          >
            {!hasSearched && !isPostsFetched && (
              <div className="text-muted-foreground mt-24 flex flex-col items-center justify-center text-center">
                <TextSearch className="mb-2 size-24" />
              </div>
            )}
            {isFetchingFirstPostsPage && <FeedSkeletons count={3} />}
            {!isFetchingFirstPostsPage &&
              isPostsFetched &&
              posts.length === 0 && (
                <div className="text-muted-foreground mt-24 flex flex-col items-center justify-center text-center">
                  <TextSearch className="mb-2 size-24" />
                  <div className="text-lg">No posts found.</div>
                </div>
              )}

            {posts?.map((post) => (
              <Post post={post} className="mb-1 lg:mb-2" key={post.id} />
            ))}

            {isFetchingNextPostsPage && <FeedSkeletons count={1} />}
          </InfiniteScrollContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}
