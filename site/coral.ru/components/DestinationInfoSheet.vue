<script setup>
import InfoFlight from "./InfoFlight.vue";
import InfoTimezone from "./InfoTimezone.vue";
import InfoAvgTemp from "./InfoAvgTemp.vue";
import InfoVisa from "./InfoVisa.vue";
import { computed, inject } from "vue";

const { selectedDestination } = inject('destination-selector');
const destinationRussia = computed(() => selectedDestination.value?.id === 'russia');

const { destinationSelectorMode } = inject('destination-selector');

</script>

<template>
    <div class="info-sheet" :class="{ hidden: destinationRussia }" :data-view-mode="destinationSelectorMode">
        <InfoFlight/>
        <InfoTimezone/>
        <InfoAvgTemp/>
        <InfoVisa/>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/layout";
.info-sheet {
    overflow: hidden;
    border-radius: 1em;
    box-shadow: 0 -.5em .5em fade(black, 7%);
    padding: .7em 1em;
    display: grid;
    gap: 1em;
    .transit(height, .2s);
    .transit(padding, .2s);
    .transit(box-shadow, .2s);
    .transit(opacity, .2s);
    &[data-view-mode=list] {
        grid-template-columns: repeat(4,auto);
        justify-content: space-evenly;
        justify-items: center;
    }
    &[data-view-mode=map] {
        grid-template-rows: repeat(4,auto);
        justify-content: stretch;
        box-shadow: none;
        padding: 0 1em 1.5em 0;
    }
    &.hidden {
        height: 0;
        padding-top: 0;
        padding-bottom: 0;
        box-shadow: none;
        opacity: 0;
    }
}
</style>