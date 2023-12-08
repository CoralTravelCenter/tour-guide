<script setup>

import InfoFlight from "./InfoFlight.vue";
import InfoTimezone from "./InfoTimezone.vue";
import InfoAvgTemp from "./InfoAvgTemp.vue";
import InfoVisa from "./InfoVisa.vue";
</script>

<template>
    <div class="info-sheet">
        <InfoFlight/>
        <InfoTimezone/>
        <InfoAvgTemp/>
        <InfoVisa/>
    </div>
</template>

<style scoped lang="less">
.info-sheet {
    border-radius: 1em;
    box-shadow: 0 -.5em .5em fade(black, 7%);
    padding: .7em 1em;
    display: grid;
    justify-content: space-evenly;
    justify-items: center;
    grid-template-columns: repeat(4,auto);
    gap: 1em;

}
</style>