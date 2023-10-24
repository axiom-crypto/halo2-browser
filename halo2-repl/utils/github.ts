export const fetchGithubAccessToken = async (code: string) => {
    const res = await fetch("/api/github", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
    });
    const json = await res.json();
    return json.token ?? null;
};

export const fetchGist = async (gistId: string) => {
    const res = await fetch("https://api.github.com/gists/" + gistId);
    if (!res.ok) throw new Error("invalid gist id");
    const json = await res.json();
    return json;
}