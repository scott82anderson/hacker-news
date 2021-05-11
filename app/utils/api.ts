import fetch from "node-fetch"

const api = `https://hacker-news.firebaseio.com/v0`
const json = '.json?print=pretty'

export type PostCategory = "comment" | "story";
export type PostTypes = "top" | "new";

export interface Post {
  dead: boolean;
  deleted: boolean;
  type: PostCategory;
  url: string;
  title: string;
  id: string;
  descendants?: number;
  time: number;
  by: string;
  text?:string;
  kids?:string[]
}

export interface IUser {
  created: number;
  id: string;
  karma: number;
  about: string;
  submitted: string[];
}

function removeDead (posts: Post[]) {
  return posts.filter(Boolean).filter(({ dead }) => dead !== true)
}

function removeDeleted (posts: Post[]) {
  return posts.filter(({ deleted }) => deleted !== true)
}

function onlyComments (posts: Post[]) {
  return posts.filter(({ type }) => type === 'comment')
}

function onlyPosts (posts: Post[]) {
  return posts.filter(({ type }) => type === 'story')
}

export function fetchItem (id:string): Promise<Post> {
  return fetch(`${api}/item/${id}${json}`)
    .then((res) => res.json())
}

export function fetchComments (ids:string[]): Promise<Post[]> {
  return Promise.all(ids.map(fetchItem))
    .then((comments) => removeDeleted(onlyComments(removeDead(comments))))
}

export function fetchMainPosts (type:PostTypes): Promise<Post[]> {
  return fetch(`${api}/${type}stories${json}`)
    .then((res) => res.json())
    .then((ids) => {
      if (!ids) {
        throw new Error(`There was an error fetching the ${type} posts.`)
      }

      return ids.slice(0, 50)
    })
    .then((ids) => Promise.all(ids.map(fetchItem) as Post[]))
    .then((posts) => removeDeleted(onlyPosts(removeDead(posts))))
}

export function fetchUser (id: string): Promise<IUser> {
  return fetch(`${api}/user/${id}${json}`)
    .then((res) => res.json())
}

export function fetchPosts (ids: string[]): Promise<Post[]> {
  return Promise.all(ids.map(fetchItem) as Promise<Post>[])
    .then((posts) => removeDeleted(onlyPosts(removeDead(posts))))
}