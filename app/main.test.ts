import {fetchMainPosts} from "./utils/api"


test("top posts are returned", () => {
    return fetchMainPosts("top").then(posts => {
        expect(posts.length).toBeGreaterThan(0);
    });
});

test("new posts are returned", async () => {
    const posts = await fetchMainPosts("new");
    expect(posts.length).toBeGreaterThan(0);
});
