<template>
    <li>
        <i class="material-icons" v-if="type==0">double_arrow</i>
        <i class="material-icons" v-if="type==1">chevron_right</i>
        <i class="material-icons" v-if="type==2">check</i>
        <i class="material-icons" v-if="type==3">close</i>
        <template v-if="type==0||type>=4"><a :href="`https://www.twitch.tv/${list.from_login}`" target="_blank">{{list.from_name}}</a></template>
        <template v-else><a :href="`https://www.twitch.tv/${list.to_login}`" target="_blank">{{list.to_name}}</a></template>
        <span v-if="type==0||type==4">{{calculateTime(list.followed_at) | daysFormat}}</span>
    </li>
</template>
<script>

export default {
    name: 'ListView',
    props: {
        list:{type:Object, required:true},
        type:{type:Number, required:true}
    },
    mounted(){
    
    },
    methods:{
        calculateTime(twitchDate){
            var d1 = new Date(); //"now"
            var d2 = new Date(twitchDate);  // some date
            var diff = Math.abs(d1-d2)/1000;  // difference in milliseconds
            return diff
        }
    }
}
</script>
<style lang="scss" scoped>
@import 'https://fonts.googleapis.com/icon?family=Material+Icons';
@import url('https://fonts.googleapis.com/css2?family=Anek+Odia:wght@600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Anek+Odia:wght@400&display=swap');

li{
    list-style-type: none;text-align: left;margin-bottom:5px;
    font-family: 'Anek Odia',Arial, Helvetica, sans-serif;
    font-size:16px;
    position: relative;
    font-size:16px;
    color:#000;
    padding-left: 0;
    list-style-type: none;
    a{
    text-decoration: none;  
    font-weight:600
    }
    span{
        display:inline-block;
        vertical-align: top;
        width:100%;
        font-size:80%;
        color:#666;
        font-weight:400;
    }
}
.material-icons{font-size:100%;vertical-align: -2px;}
</style>