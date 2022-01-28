const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());

app.get('/api/stats/:username', async (req, res) => {
  const { username } = req.params;
  let totalRepos = 0,
    totalFollowers = 0,
    totalFollowing = 0,
    totalStars=0;
  let curRepos = 100,
    curFollowers = 100,
    curFollowing = 100,
    curStars=100;
  let value = 1,
    page = 1;


  const { data } = await axios.get(
    `https://api.github.com/search/commits?q=author:${username}`
  );

  while (value > 0) {
    if(curStars == 100){
       const stars = await axios.get(
        `https://api.github.com/users/${username}/repos`,
        {
          params: { page,per_page:100 },
        }
      );
      stars.data.map(val=>{
      totalStars+=val.stargazers_count;
    })
      curStars = stars.data.length;
    }else{
      curStars=0;
    }

    if (curFollowers == 100) {
      const followers = await axios.get(
        `https://api.github.com/users/${username}/followers`,
        {
          params: { page,per_page:100 },
        }
      );
    
      curFollowers = followers.data.length;
    }else{
      curFollowers=0;
    }

    if (curFollowing == 100) {
      const following = await axios.get(
        `https://api.github.com/users/${username}/following`,
        {
          params: { page,per_page:100 },
        }
      );
      curFollowing = following.data.length;
    }else{
      curFollowing=0;
    }

    if (curRepos == 100) {
      const repos = await axios.get(
        `https://api.github.com/users/${username}/repos`,
        {
          params: { page,per_page:100 },
        }
      );
      curRepos = repos.data.length;
    }else{
      curRepos=0;
    }

   
    totalFollowers += curFollowers;
    totalFollowing += curFollowing;
    totalRepos += curRepos;
    page += 1;
    console.log({ curFollowers, curFollowing, curRepos, curStars });
    value = curFollowers || curFollowing || curRepos || curStars;
    console.log(value);
  }
  res.json({
    commits: data.total_count,
    stars:totalStars,
    followers: totalFollowers,
    following: totalFollowing,
    repos: totalRepos,
  });
});

app.listen(4000, () => {
  console.log('Auth Server Running On Port 4000');
});
