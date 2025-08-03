"use client";
import { useState } from "react";
import { SettingsProvider } from '../../../contexts/SettingsContext';
import { SocialShareProvider } from '../../../contexts/SocialShareContext';
import PostList from './post-list/page';
import PostEditor from './post-editor/page'; // Import your PostEditor
import { Post } from '../../../types/Post';

export default function PostsPage() {
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Handler for creating a new post
  const handleCreatePost = () => setEditingPost({} as Post);

  // Handler for editing an existing post
  const handleEditPost = (post: Post) => setEditingPost(post);

  // Handler for closing the editor
  const handleBack = () => setEditingPost(null);

  return (
    <SettingsProvider>
      <SocialShareProvider>
        {editingPost ? (
          <PostEditor post={editingPost} onBack={handleBack} />
        ) : (
          <PostList
            onCreatePost={handleCreatePost}
            onEditPost={handleEditPost}
          />
        )}
      </SocialShareProvider>
    </SettingsProvider>
  );
}