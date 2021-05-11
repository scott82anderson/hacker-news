import React from "react";
import queryString from "query-string";
import { fetchUser, fetchPosts, Post, IUser } from "../utils/api";
import Loading from "./Loading";
import { formatDate } from "../utils/helpers";
import PostsList from "./PostsList";

type PostActions = {type:"fetch"}|{type:"user", user:IUser}|{type:"posts",posts: Post[]}|{type:"error",message:string}

interface PostState {
  loadingPosts: boolean;
  loadingUser: boolean;
  posts: Post[]|null;
  user: IUser|null;
  error:string|null;
}

function postReducer(state:PostState, action:PostActions): PostState {
  if (action.type === "fetch") {
    return {
      ...state,
      loadingUser: true,
      loadingPosts: true,
    };
  } else if (action.type === "user") {
    return {
      ...state,
      user: action.user,
      loadingUser: false,
    };
  } else if (action.type === "posts") {
    return {
      ...state,
      posts: action.posts,
      loadingPosts: false,
      error: null,
    };
  } else if (action.type === "error") {
    return {
      ...state,
      error: action.message,
      loadingPosts: false,
      loadingUser: false,
    };
  } else {
    throw new Error(`That action type is not supported.`);
  }
}

export default function User({ location }: {location:Location}): JSX.Element {
  const { id } = queryString.parse(location.search) as { id: string };

  const [state, dispatch] = React.useReducer(postReducer, {
    user: null,
    loadingUser: true,
    posts: null,
    loadingPosts: true,
    error: null,
  });

  React.useEffect(() => {
    dispatch({ type: "fetch" });

    fetchUser(id)
      .then((user) => {
        dispatch({ type: "user", user });
        return fetchPosts(user.submitted.slice(0, 30));
      })
      .then((posts) => dispatch({ type: "posts", posts }))
      .catch(({ message }) => dispatch({ type: "error", message }));
  }, [id]);

  const { user, posts, loadingUser, loadingPosts, error } = state;

  if (error) {
    return <p className="center-text error">{error}</p>;
  }

  return (
    <React.Fragment>
      {loadingUser === true || user === null ? (
        <Loading text="Fetching User" />
      ) : (
        <React.Fragment>
          <h1 className="header">{user.id}</h1>
          <div className="meta-info-light">
            <span>
              joined <b>{formatDate(user.created)}</b>
            </span>
            <span>
              has <b>{user.karma.toLocaleString()}</b> karma
            </span>
          </div>
          <p dangerouslySetInnerHTML={{ __html: user.about }} />
        </React.Fragment>
      )}
      {loadingPosts === true || posts === null ? (
        loadingUser === false && <Loading text="Fetching posts" />
      ) : (
        <React.Fragment>
          <h2>Posts</h2>
          <PostsList posts={posts} />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
