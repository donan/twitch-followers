<template>
  <div>
      <div class="card mb-4">
          <div class="card-header">
              <h1 class="card-title">Twitch Followers List</h1>
          </div>
          <div class="card-body">
            <div class="row">
              <p>The purpose of this project is to let twitch users check their follows. This website will only store your authorization code on your browser and use it to connect to the twitch API. My APP only serves as a key to let you read your data.</p>
              <ol>
                <li><strong>1. Authorize the app to get access to the Twitch API</strong><br/><em>(No data is stored on this website)</em></li>
                <li><strong>2. Browse your followers, mutuals and unmutuals</strong><br/></li>
              </ol>
            </div>
          </div>
      </div>
    <div class="card">
          <div class="card-header">
              <h2 class="card-title">Recent Changes</h2>
          </div>
          <div class="card-body">
            <div class="row">
              <ul>
                <li>
                  <h3>1.2</h3>
                  <p>Bug fixes and tracking date for new trackings.</p>
                </li>
                <li>
                  <h3>1.1</h3>
                  <p>Release of the Track followers feature.</p>
                </li>
                <li>
                  <h3>1.0</h3>
                  <p>First release.</p>
                </li>
              </ul>
            </div>
          </div>
      </div>
  </div>
</template>

<script>

export default {
  name: 'HomeView'
}
</script>
<style scoped>
  ul{margin-bottom:0}
  ol li, ul li{list-style-type: none}
</style>