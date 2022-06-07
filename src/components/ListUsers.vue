<template>
    <div class="pb-4">
        <input type="text" v-model="search" placeholder="Search name" class="form-control mb-3" v-if="followersList.length>pageAmount">
        <ul :class="listClass">
           <list-card v-for="entries in getPaginatedList" :key="entries.followed_at" :list="entries" :type="listType"/>
        </ul>
        <div class="buttons">
            <template v-if="followersList.length>pageAmount">
                <!--<button @click.prevent="changePage('prev')" class="btn btn-info" :disabled="currentPage==0">Prev</button>
                <button @click.prevent="changePage('next')" class="btn btn-info" :disabled="isEndPage">Next</button>-->
                <button v-for="pageNumber in totalPages"
                v-show="Math.abs(pageNumber-1 - currentPage) < 4 || pageNumber == totalPages || pageNumber-1 == 0"
                :key="pageNumber"
                @click="setPage(pageNumber-1)"
                :disabled="currentPage==pageNumber-1" 
                class="btn btn-info"
                >
                <span v-if="pageNumber == totalPages && Math.abs(pageNumber-1 - currentPage) > 4">...</span>
                {{ pageNumber }}
                <span v-if="pageNumber == 1 && Math.abs(pageNumber - currentPage) > 3">...</span>
                </button>
                </template>
        </div>
    </div>
</template>
<script>
import ListCard from './ListCard.vue'

export default {
    name: 'ListView',
    props: {
        listType:{type:Number, required:true},
        followersList:{type:Array, required:true}
    },
    components: {
        ListCard
    },
    data(){
        return{
            currentPage: 0,
            pageAmount: 39,
            listClass: '',
            search: ''
        }
    },
    computed:{
        isEndPage(){
            return this.currentPage==this.totalPages-1
        },
        totalPages() {
            return Math.ceil(this.filteredItems.length / this.pageAmount)
        },
        filteredItems() {
            return this.followersList.filter(item => {
                if(this.listType==0){
                    return item.from_name.toLowerCase().includes(this.search.toLowerCase())
                }else{
                    return item.to_name.toLowerCase().includes(this.search.toLowerCase())
                }
            })
        },
        getPaginatedList(){
            const index = this.currentPage * this.pageAmount
            return this.filteredItems.slice(index, index + this.pageAmount)
        },
    },
    methods: {
        setPage(pageNumber) {
            this.listClass = 'fadeOut'
                setTimeout(function(){
            this.currentPage = pageNumber
            this.listClass = 'fadeIn'
             }.bind(this), 300)
            setTimeout(function(){
                this.listClass = ''
            }.bind(this), 600)
        },
        changePage(action){
            //Change page animation and checks
            this.listClass = 'fadeOut'
            setTimeout(function(){
                if(action =='prev'){
                    this.currentPage--
                }else{
                    this.currentPage++
                }
                if (this.currentPage >= this.totalPages || this.currentPage < 0) {
                    this.currentPage = 0
                }
                this.listClass = 'fadeIn'
            }.bind(this), 300)
            setTimeout(function(){
                this.listClass = ''
            }.bind(this), 600)
        }
    }
}
</script>
<style lang="scss" scoped>
ul{
    column-count: 3;
    @media (max-width: 769px) {column-count: 2}
    @media (max-width: 481px) {column-count: 1}
    column-gap: 10px;
    text-align:left;
    padding-left:0;
    margin-bottom:0;
    &.fadeIn{animation: fadeIn 0.25s linear;opacity:1}
    &.fadeOut{animation: fadeOut 0.25s linear;opacity:0}
}
@keyframes fadeIn {
0% {opacity:0}
100% {opacity:1}
}
@keyframes fadeOut {
0% {opacity:1}
100% {opacity:0}
}
</style>