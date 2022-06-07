<template>
  <div>
    <h1>List</h1>
      <template v-if="!error">
        <div v-if="loaded">
          <b-tabs content-class="mt-3">
              <b-tab :title="`Followers (${followers.length})`" active>
                  <ListUsers :followersList="followers" :listType="0" />
              </b-tab>
              <b-tab :title="`Following (${follows.length})`">
                  <ListUsers :followersList="follows" :listType="1" />
              </b-tab>
              <b-tab :title="`Mutuals (${mutuals.length})`">
                  <ListUsers :followersList="mutuals" :listType="2" />
              </b-tab>
              <b-tab :title="`Unmutuals (${notMutuals.length})`">
                  <ListUsers :followersList="notMutuals" :listType="3" />
              </b-tab>
          </b-tabs>
        </div>
        <div v-else>
          <p>Loading data</p>
          <div class="lds-facebook"><div></div><div></div><div></div></div>
        </div>
      </template>
      <template v-else>
        {{error}}
      </template>
  </div>
</template>

<script>
import ListUsers from '@/components/ListUsers'

export default {
    name: 'ListView',
    components: {
        ListUsers
    },
    data(){
        return{
            followers:[],
            follows:[],
            loaded:false,
            apiUsers: 'users',
            apiFollows: 'users/follows',
            broadID: null,
            auth: null,
            login:null,
            error:null,
            requestAmount:100
        }
    },
    created(){
      if(this.currentAuth&&this.currentLogin){
        this.auth = this.currentAuth
        this.login = this.currentLogin
        this.getUserId()
      }else{
        this.error="Please, do the authentication step first"
      }
    },
    computed:{
        currentAuth(){
            return localStorage.twFollowsAuth
        },
        currentLogin(){
            return localStorage.twFollowsLogin
        },
        mutuals() {
            return this.follows.filter((follow) =>this.followers.map((followers) => followers.from_id).includes(follow.to_id));
        },
        notMutuals() {
            return this.follows.filter((follow) =>!this.followers.map((followers) => followers.from_id).includes(follow.to_id));
        },
    },
    methods:{
      async getUserId(){
        //Get broadcasterID
        let headers = {
          "Authorization": `Bearer ${this.auth}`,
          "Client-ID": process.env.VUE_APP_CID
        }
        try {
          const response = await this.axios
          .get(`${process.env.VUE_APP_API_SERVER}${this.apiUsers}`,{params:{"login":this.login}, headers:headers})
          const resp_data = response.data
          this.broadID = resp_data.data[0].id     
          //Request Lists to twitch
          await this.getFollowsList('from')
          await this.getFollowsList('to')
          this.loaded = true
        } catch (error) {
          this.error=error
        }
      },
      async getFollowsList(followType){
        let hasNextPage = true
        let nextCursor = null
        let requestType = followType
        //Loop to get all the follows
        while (hasNextPage) {
          let resp = await this.requestFollows(nextCursor,requestType)
          if (resp) {
              if (resp.data) {
                  if(requestType==='from'){
                    this.follows = [...this.follows, ...resp.data]
                  }else{
                    this.followers = [...this.followers, ...resp.data]
                  }
              }
              if (resp.pagination.cursor) {
                  nextCursor = resp.pagination.cursor
                  this.pages++
              } else {
                  //Fail-safe
                  hasNextPage = false
              }
          }else{
            //Finish the loop and order the list
            hasNextPage = false
          }
        }
      },
      async requestFollows(nextCursor,requestType){
        let headers = {
          "Authorization": `Bearer ${this.auth}`,
          "Client-ID": process.env.VUE_APP_CID
        }
        let params = {
          "first": this.requestAmount
        }
        if (nextCursor){
          params.after = nextCursor
        }
        if(requestType=="from"){
          params.from_id = this.broadID
        }else{
          params.to_id = this.broadID
        }
        try {
          const resp = await this.axios.get(`${process.env.VUE_APP_API_SERVER}${this.apiFollows}`,{params:params, headers:headers})
          return await resp.data
        } catch (error) {
          this.error=error
        }
      }
    }
}
</script>
<style scoped>
.lds-facebook {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-facebook div {
  display: inline-block;
  position: absolute;
  left: 8px;
  width: 16px;
  background: #000;
  animation: lds-facebook 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite;
}
.lds-facebook div:nth-child(1) {
  left: 8px;
  animation-delay: -0.24s;
}
.lds-facebook div:nth-child(2) {
  left: 32px;
  animation-delay: -0.12s;
}
.lds-facebook div:nth-child(3) {
  left: 56px;
  animation-delay: 0;
}
@keyframes lds-facebook {
  0% {
    top: 8px;
    height: 64px;
  }
  50%, 100% {
    top: 24px;
    height: 32px;
  }
}
</style>
