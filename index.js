const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());

app.get('/api/stats/:username', async (req, res) => {
  const { username } = req.params;
  let totalStars=0;
  let curStars=100;
  let value = 1,
      page = 1;


  const { data } = await axios.get(
      `https://api.github.com/search/commits?q=author:${username}`
  );

  const userData=await axios.get(
      `https://api.github.com/users/${username}`
  ).then(res=>res.data);

  while (value > 0) {
    if(curStars === 100){
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

    page += 1;
    value = curStars;
  }
  res.json({
    username:userData.login,
    avatar:userData.avatar_url,
    commits: data.total_count,
    stars:totalStars,
    followers: userData.followers,
    following: userData.following,
    repos: userData.public_repos,
  });
});

app.listen(4000, () => {
  console.log('Auth Server Running On Port 4000');
});