<script setup>

import { computed, inject } from "vue";

const { selectedDestination } = inject('destination-selector');
const preferredSearchParams = inject('preferred-search-params');

const displayedMonthName = computed(() => {
    const month_idx = preferredSearchParams.timeframe.selectedMoment?.month() || moment().month();
    return ['январе', 'феврале', 'марте', 'апреле', 'мае', 'июне', 'июле', 'августе', 'сентябре', 'октябре', 'ноябре', 'декабре'][month_idx];
});

const displayedTemp = computed(() => {
    const month_idx = preferredSearchParams.timeframe.selectedMoment?.month() || moment().month();
    const temp = Math.round(selectedDestination.value?.avgTemperature[month_idx]);
    return `${ temp > 0 ? '+' : '' }${ temp }&deg;`;
});

</script>

<template>
    <div class="infosheet-item avg-temp">
        <img class="icon" src="/site/coral.ru/assets/icon-avg-temp.png">
        <div class="info">
            Средняя температура <br>
            <strong>в {{ displayedMonthName }}</strong> <strong v-html="displayedTemp"></strong>
        </div>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/info-sheet";
strong {
    //display: block;
}
</style>