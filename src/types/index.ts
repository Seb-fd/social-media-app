export type Post = {
  id: string;
  content: string | null;
  image: string | null;
  createdAt: Date | string;
  author: {
    id: string;
    username: string;
    name: string | null;
    image: string | null;
  };
  likes: { userId: string }[];
  comments: {
    id: string;
    content: string;
    createdAt: Date | string;
    authorId: string;
    postId: string;
    author: {
      id: string;
      username: string;
      name: string | null;
      image: string | null;
    };
  }[];
  _count: {
    likes: number;
    comments: number;
  };
};

export type User = {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  image: string | null;
  location: string | null;
  website: string | null;
  createdAt: Date | string;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
  followers: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  }[];
  following: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  }[];
};
