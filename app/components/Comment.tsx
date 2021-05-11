import React from 'react'
import PostMetaInfo from './PostMetaInfo'
import { Post } from '../utils/api'

export default function Comment ({ comment }: {
  comment: Pick<Post, "by" | "time" | "id" | "text">;
}): JSX.Element {
  return (
    <div className='comment'>
      <PostMetaInfo
        by={comment.by}
        time={comment.time}
        id={comment.id}
      />
      { comment.text && <p dangerouslySetInnerHTML={{__html: comment.text}} />}
    </div>
  )
}