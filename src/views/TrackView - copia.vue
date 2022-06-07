<template>

    <div class="card">
        <div class="card-header">
            <h1 class="card-title">Track Followers <span class="badge badge-danger">Beta</span></h1>
        </div>
        <div class="card-body">
          <template v-if="!error">
          <p>Press "Start Tracking" to store your current followers list on your browser.</p>
          <p>Press "Find changes" to find out who followed or unfollowed you on twitch since the last start tracking.</p>
            <div v-if="loaded">
              <button class="btn btn-success" @click.prevent="saveFollowers()">Start Tracking</button>
              <template v-if="temp.length>0"> - <button class="btn btn-danger" @click.prevent="findChanges()">Find Changes</button></template>
              <template v-if="isDebug"> - <button class="btn btn-danger" @click.prevent="clearData()">Clear Tracking Data</button></template>
              <p v-if="lastDate" class="currentTracking">Current tracking data from {{lastDate}}</p>
              <template v-if="newFollowers.length>=1">
              <hr/>
              <h3 class="mt-3 mb-2">New followers ({{newFollowers.length}})</h3>
              <ListUsers :followersList="newFollowers" :listType="4"/>
              </template>
              <template  v-if="lostFollowers.length>=1">
              <hr/>
              <h3 class="mt-3 mb-2">Lost followers ({{lostFollowers.length}})</h3>
              <ListUsers :followersList="lostFollowers" :listType="5"/>
              </template>
              <template v-if="showChanges">
                <hr/>
                No changes found
              </template>
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
            newFollowers:[],
            lostFollowers:[],
            temp:[],
            loaded:false,
            apiUsers: 'users',
            apiFollows: 'users/follows',
            broadID: null,
            auth: null,
            login:null,
            error:null,
            requestAmount:100,
            lastDate:''
        }
    },
    created(){
        if(this.currentAuth&&this.currentLogin){
          this.auth = this.currentAuth
          this.login = this.currentLogin
          if(localStorage.twFollowsData){
            this.temp = this.retrieveObject('twFollowsData')
          }
          if(this.currentTrackDate){
            this.lastDate = this.currentTrackDate.slice(1, -1)
          }
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
        currentTrackDate(){
            return localStorage.twFollowsTrackDate
        },
        isDebug(){
            return process.env.NODE_ENV ==='development'
        },
        showChanges(){
          return this.lostFollowers.length==0&&this.newFollowers.length==0&&this.temp.length>0&&this.followers.length>0
        }
    },
    methods:{
      clearData(){
        this.temp= []
        localStorage.removeItem('twFollowsData')
        localStorage.removeItem('twFollowsTrackDate')
      },
      async findChanges(){
        this.temp = this.retrieveObject('twFollowsData')
        this.loaded=false
        this.followers=[]
        await this.getFollowsList()
        if(!this.error){
          this.newFollowers =this.followers.filter((follow) =>!this.temp.map((followers) => followers.from_id).includes(follow.from_id))
          this.lostFollowers =this.temp.filter((temp) =>!this.followers.map((followers) => followers.from_id).includes(temp.from_id))
        }else{
          this.error= 'Not enough data or you have reached the request limit'
        }
      },
      async saveFollowers(){
        this.loaded=false
        this.followers=[]
        this.newFollowers=[]
        this.lostFollowers=[]
        await this.getFollowsList()
        if(!this.error){
          this.temp = this.followers
          let today = new Date().toLocaleString()
          this.lastDate = today
          this.storeObject('twFollowsData',this.followers)
          this.storeObject('twFollowsTrackDate',this.lastDate)
          this.$notify({type:'success',text: 'Tracking Started!'})
        }else{
          this.error= 'Not enough data or you have reached the request limit'
        }
      },
      storeObject(key,value){
          localStorage.setItem(key, JSON.stringify(value))
      },
      retrieveObject(key){
          let value = localStorage.getItem(key)
          return value && JSON.parse(value)
      },
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
          //Request Subs List to twitch
          this.loaded = true
        } catch (error) {
          this.error=error
        }
      },
      async getFollowsList(){
        let hasNextPage = true
        let nextCursor = null
        //Loop to get all the follows
        while (hasNextPage) {
          let resp = await this.requestFollows(nextCursor)
          if (resp) {
              if (resp.data) {
                this.followers = [...this.followers, ...resp.data]
              }
              if (resp.pagination.cursor) {
                  nextCursor = resp.pagination.cursor
                  this.pages++
              } else {
                  hasNextPage = false
                  this.loaded=true
              }
          }else{
            //Finish the loop and order the list
            hasNextPage = false
            this.loaded=true
          }
        }
      },
      async requestFollows(nextCursor){
        let headers = {
          "Authorization": `Bearer ${this.auth}`,
          "Client-ID": process.env.VUE_APP_CID
        }
        let params = {
          "first": this.requestAmount,
          "to_id" : this.broadID
        }
        if (nextCursor){
          params.after = nextCursor
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
.currentTracking{margin-top:5px;font-style: italic;}
.badge{background:#dc3545;font-size:35%;vertical-align: top;}
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
