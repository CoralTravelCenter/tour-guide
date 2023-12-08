<script setup>

import { inject } from "vue";

const { selectedDestination } = inject('destination-selector');

</script>

<template>
    <div class="infosheet-item flight">
        <img class="icon" src="/site/coral.ru/assets/icon-direct-flight.png">
        <div class="info">
            Прямой рейс
            <strong v-if="selectedDestination">около {{ selectedDestination.flightDuration }} ч</strong>
            <strong v-else>...</strong>
        </div>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/info-sheet";
strong {
    display: block;
}
</style>