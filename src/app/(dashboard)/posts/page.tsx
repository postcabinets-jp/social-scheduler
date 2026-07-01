import { getPosts } from "@/app/actions/posts";
import { PostsTable } from "@/components/posts/posts-table";

export default async function PostsPage() {
  const { data: posts, count } = await getPosts({ limit: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">投稿履歴</h1>
        <p className="text-gray-500 mt-1">全 {count} 件</p>
      </div>
      <PostsTable posts={posts} />
    </div>
  );
}
