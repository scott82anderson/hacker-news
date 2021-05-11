import React from "react";
import queryString from "query-string";
import { fetchItem, fetchComments, Post as IPost } from "../utils/api";
import Loading from "./Loading";
import PostMetaInfo from "./PostMetaInfo";
import Title from "./Title";
import Comment from "./Comment";

type PostActions = {type:"fetch"}|{type:"post",post: IPost}|{type:"comments",comments:IPost[]}|{type:"error",error:Error}

interface PostState {
  loadingPost: boolean;
  loadingComments: boolean;
  post: IPost|null;
  comments: IPost[]|null;
  error:Error|null;
}

function postReducer(state:PostState, action:PostActions): PostState {
  if (action.type === "fetch") {
    return {
      ...state,
      loadingPost: true,
      loadingComments: true,
    };
  } else if (action.type === "post") {
    return {
      ...state,
      loadingPost: false,
      post: action.post,
    };
  } else if (action.type === "comments") {
    return {
      ...state,
      loadingComments: false,
      comments: action.comments,
    };
  } else if (action.type === "error") {
    return {
      ...state,
      loadingComments: false,
      loadingPost: false,
      error: action.error,
    };
  } else {
    throw new Error(`That action type is not supported.`);
  }
}

export default function Post({ location }: {location: Location}): JSX.Element {
  const { id } = queryString.parse(location.search) as { id: string };

  const [state, dispatch] = React.useReducer(postReducer, {
    post: null,
    loadingPost: true,
    comments: null,
    loadingComments: true,
    error: null,
  });

  const { post, loadingPost, comments, loadingComments, error } = state;

  React.useEffect(() => {
    dispatch({ type: "fetch" });

    fetchItem(id)
      .then((post) => {
        dispatch({ type: "post", post });
        return fetchComments(post.kids || []);
      })
      .then((comments) => dispatch({ type: "comments", comments }))
      .catch(({ message }) =>
        dispatch({
          type: "error",
          error: message,
        })
      );
  }, [id]);

  if (error) {
    return <p className="center-text error">{error}</p>;
  }

  return (
    <React.Fragment>
      {loadingPost === true ? (
        <Loading text="Fetching post" />
      ) : (
        post && <React.Fragment>
          <h1 className="header">
            <Title url={post.url} title={post.title} id={post.id} />
          </h1>
          <PostMetaInfo
            by={post.by}
            time={post.time}
            id={post.id}
            descendants={post.descendants}
          />
          {post.text && <p dangerouslySetInnerHTML={{ __html: post.text }} />}
        </React.Fragment>
      )}
      {loadingComments === true ? (
        loadingPost === false && <Loading text="Fetching comments" />
      ) : (
        <React.Fragment>
          {comments && comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </React.Fragment>
      )}
    </React.Fragment>
  );
}
