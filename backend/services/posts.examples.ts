import { postsService } from "./posts";

/**
 * Example usage of the PostsService
 * This file demonstrates how to use the posts service for managing drafts
 */

// Example 1: Creating a new post (starts as draft)
async function createNewPost() {
  const newPost = await postsService.createPost({
    title: "My First Blog Post",
    content: "This is the content of my first blog post...",
    cover: "https://example.com/cover.jpg",
    authorId: "user-123",
    createdBy: "user-123",
  });

  console.log("Created new post:", newPost);
  // Result: { post: {...}, version: {...} }
  // The version will have status: 'draft'
}

// Example 2: Creating a draft from a published post
async function editPublishedPost() {
  const postId = "post-456";

  // This copies the published content and creates a draft
  const draft = await postsService.createDraftFromPublished(postId, "user-123");

  console.log("Created draft from published:", draft);
  // Result: { version: {...}, isNew: true }
}

// Example 3: Updating an existing draft
async function updateExistingDraft() {
  const postId = "post-456";

  // First, create or update a draft
  const draft = await postsService.createOrUpdateDraft({
    postId,
    title: "Updated Title",
    content: "Updated content...",
    changeNote: "Fixed typos and added more examples",
    createdBy: "user-123",
  });

  console.log("Draft updated:", draft);
  // If draft existed: { version: {...}, isNew: false }
  // If new draft: { version: {...}, isNew: true }
}

// Example 4: Publishing a draft
async function publishDraft() {
  const postId = "post-456";

  // Check if there's a draft first
  const hasDraft = await postsService.hasDraft(postId);
  if (!hasDraft) {
    console.log("No draft to publish");
    return;
  }

  // Publish the draft
  const publishedVersion = await postsService.publishDraft(postId);

  console.log("Published draft:", publishedVersion);
  // The version status is now 'published'
  // The post's currentVersionId is updated
  // The post's publishedAt is set
}

// Example 5: Getting the working version (for editing)
async function getWorkingVersion() {
  const postId = "post-456";

  const workingVersion = await postsService.getWorkingVersion(postId);

  if (workingVersion) {
    console.log("Working version:", workingVersion);
    // Result: { version: {...}, isDraft: true/false }

    if (workingVersion.isDraft) {
      console.log("User is editing a draft");
    } else {
      console.log("User is viewing published version");
    }
  } else {
    console.log("No version found");
  }
}

// Example 6: Getting post info for the editor
async function getPostForEditor() {
  const postId = "post-456";

  const postInfo = await postsService.getPostWithCurrentVersion(postId);

  if (postInfo) {
    console.log("Post info:", postInfo);
    // Result: {
    //   post: {...},
    //   currentVersion: {...},
    //   isDraft: true/false,
    //   hasDraft: true/false
    // }

    if (postInfo.hasDraft) {
      console.log("Post has unsaved changes");
    }
  }
}

// Example 7: Workflow for a typical editing session
async function typicalEditingWorkflow() {
  const postId = "post-456";
  const userId = "user-123";

  // 1. Get the current working version
  const workingVersion = await postsService.getWorkingVersion(postId);

  if (!workingVersion) {
    console.log("Post not found");
    return;
  }

  // 2. If no draft exists, create one from published version
  if (!workingVersion.isDraft) {
    console.log("Creating draft from published version...");
    await postsService.createDraftFromPublished(postId, userId);
  }

  // 3. User makes changes - update the draft
  await postsService.updateDraft(postId, {
    title: "Updated Title",
    content: "Updated content with new information...",
    changeNote: "Added new section about advanced features",
  });

  // 4. User decides to publish
  await postsService.publishDraft(postId);

  console.log("Changes published successfully!");
}

// Example 8: Handling multiple editors (conflict prevention)
async function handleMultipleEditors() {
  const postId = "post-456";
  const userId1 = "user-123";
  const userId2 = "user-456";

  try {
    // First user creates a draft
    const draft1 = await postsService.createDraftFromPublished(postId, userId1);
    console.log("User 1 created draft:", draft1);

    // Second user tries to create a draft (will update existing)
    const draft2 = await postsService.createOrUpdateDraft({
      postId,
      title: "User 2's changes",
      content: "Different content...",
      changeNote: "User 2 made changes",
      createdBy: userId2,
    });

    console.log("User 2 updated draft:", draft2);
    // Result: { version: {...}, isNew: false }
    // This overwrites User 1's draft - you might want to implement
    // conflict resolution in your UI

  } catch (error) {
    console.error("Error handling multiple editors:", error);
  }
}

// Example 9: Getting version history
async function getVersionHistory() {
  const postId = "post-456";

  const versions = await postsService.getPostVersions(postId);

  console.log("Version history:", versions);
  // Returns all versions ordered by version number (desc)
  // You can see the progression: draft -> published -> draft -> published
}

// Example 10: Deleting a draft
async function deleteDraft() {
  const postId = "post-456";

  try {
    await postsService.deleteDraft(postId);
    console.log("Draft deleted successfully");
  } catch (error) {
    console.error("Error deleting draft:", error);
    // Will throw if no draft exists
  }
}

// Example 11: Error handling patterns
async function errorHandlingExamples() {
  const postId = "post-456";

  try {
    // This will throw if no published version exists
    await postsService.createDraftFromPublished(postId, "user-123");
  } catch (error) {
    console.error("Cannot create draft:", error.message);
  }

  try {
    // This will throw if no draft exists
    await postsService.publishDraft(postId);
  } catch (error) {
    console.error("Cannot publish:", error.message);
  }

  try {
    // This will throw if no draft exists
    await postsService.deleteDraft(postId);
  } catch (error) {
    console.error("Cannot delete draft:", error.message);
  }
}

// Export examples for testing
export {
  createNewPost,
  editPublishedPost,
  updateExistingDraft,
  publishDraft,
  getWorkingVersion,
  getPostForEditor,
  typicalEditingWorkflow,
  handleMultipleEditors,
  getVersionHistory,
  deleteDraft,
  errorHandlingExamples,
};
