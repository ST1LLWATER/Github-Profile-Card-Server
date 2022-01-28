const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());

app.get('/api/stats/:username', async (req, res) => {
  const { username } = req.params;
  let totalRepos = 0,
    totalFollowers = 0,
    totalFollowing = 0,
    totalStarred = 0;
  let curRepos = 1,
    curFollowers = 1,
    curFollowing = 1,
    curStarred = 1;
  let value = 1,
    page = 1;

  console.log({ curRepos, curFollowers, curFollowing, curStarred });

  const { data } = await axios.get(
    `https://api.github.com/search/commits?q=author:${username}`
  );

  while (value > 0) {
    if (curStarred > 0) {
      const starred = await axios.get(
        `https://api.github.com/users/${username}/starred`,
        {
          params: { page },
        }
      );
      curStarred = starred.data.length;
    }

    if (curFollowers > 0) {
      const followers = await axios.get(
        `https://api.github.com/users/${username}/followers`,
        {
          params: { page },
        }
      );
      curFollowers = followers.data.length;
    }

    if (curFollowing > 0) {
      const following = await axios.get(
        `https://api.github.com/users/${username}/following`,
        {
          params: { page },
        }
      );
      curFollowing = following.data.length;
    }

    if (curRepos > 0) {
      const repos = await axios.get(
        `https://api.github.com/users/${username}/repos`,
        {
          params: { page },
        }
      );
      curRepos = repos.data.length;
    }

    totalStarred += curStarred;
    totalFollowers += curFollowers;
    totalFollowing += curFollowing;
    totalRepos += curRepos;
    page += 1;
    console.log({ curStarred, curFollowers, curFollowing, curRepos });
    value = curStarred || curFollowers || curFollowing || curRepos;
    console.log(value);
  }
  res.json({
    commits: data.total_count,
    starred: totalStarred,
    followers: totalFollowers,
    following: totalFollowing,
    repos: totalRepos,
  });
});

app.listen(4000, () => {
  console.log('Auth Server Running On Port 4000');
});
