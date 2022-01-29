const express = require('express');
const axios = require('axios');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: '*',
  })
);

const PORT = process.env.PORT || 4000;

app.get('/api/stats/:username', async (req, res) => {
  const { username } = req.params;
  let totalStars = 0;
  let curStars = 100;
  let curRepos = 100;
  let curIssues = 100;
  let totalIssues = 0;
  let totalPulls = 0;
  let value = 1,
    page = 1;

  try {
    const { data } = await axios.get(
      `https://api.github.com/search/commits?q=author:${username}`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    const userData = await axios
      .get(`https://api.github.com/users/${username}`, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      })
      .then((res) => res.data);

    const languages = {};

    while (value > 0) {
      if (curStars === 100) {
        const stars = await axios.get(
          `https://api.github.com/users/${username}/repos`,
          {
            headers: {
              Authorization: `token ${process.env.GITHUB_TOKEN}`,
            },
            params: { page, per_page: 100 },
          }
        );
        stars.data.map((val) => {
          totalStars += val.stargazers_count;
        });
        curStars = stars.data.length;
      } else {
        curStars = 0;
      }

      if (curRepos === 100) {
        const repos = await axios.get(
          `https://api.github.com/users/${username}/repos`,
          {
            headers: {
              Authorization: `token ${process.env.GITHUB_TOKEN}`,
            },
            params: { page, per_page: 100 },
          }
        );
        curRepos = repos.data.length;
        repos.data.map((val) => {
          if (val.language) {
            if (languages[val.language]) {
              languages[val.language] += 1;
            } else {
              languages[val.language] = 1;
            }
          }
        });
      } else {
        curRepos = 0;
      }

      if (curIssues === 100) {
        const issues = await axios.get(
          `https://api.github.com/search/issues?q=author:${username}`,
          {
            params: { page, per_page: 100 },
          }
        );
        curIssues = issues.data.items.length;
        totalIssues = issues.data.total_count;
        issues.data.items.map((issue) => {
          if (issue.pull_request) {
            totalPulls += 1;
          }
        });
      } else {
        curIssues = 0;
      }

      console.log({ curStars, curRepos, curIssues });
      page++;
      value = curStars || curRepos || curIssues;
    }

    totalIssues -= totalPulls;

    res.json({
      username: userData.login,
      avatar: userData.avatar_url,
      commits: data.total_count,
      stars: totalStars,
      followers: userData.followers,
      following: userData.following,
      repos: userData.public_repos,
      languages,
      created: userData.created_at,
      totalIssues,
      totalPulls,
    });
  } catch (e) {
    res.status(500).json({
      message:
        "Something Went Wrong With The Public API, Sending Team Lead's Github's Mock Data",
      username: 'ST1LLWATER',
      avatar: 'https://avatars.githubusercontent.com/u/62516824?v=4',
      commits: 512,
      stars: 18,
      followers: 62,
      following: 42,
      repos: 59,
      languages: {
        JavaScript: 32,
        CSS: 5,
        HTML: 5,
        Java: 1,
        'C++': 1,
        'Jupyter Notebook': 1,
      },
      created: '2020-03-22T17:55:52Z',
      totalIssues: 25,
      totalPulls: 18,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Auth Server Running On Port ${PORT}`);
});
