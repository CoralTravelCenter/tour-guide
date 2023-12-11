<script setup>

import { computed, inject, ref, watchEffect } from "vue";

const { selectedDestination, destinationSelectorMode } = inject('destination-selector');
const { selectedDeparture } = inject('departures');

const timeDiff = ref(null);

watchEffect(async () => {
    if (selectedDeparture.value && selectedDestination.value?.IANA) {
        const tz = await fetch(`https://worldtimeapi.org/api/timezone/${ selectedDestination.value.IANA }`).then(tz_response => tz_response.json());
        const [hh, mm] = tz.utc_offset.split(':').map(dd => parseInt(dd));
        const dest_gmt = hh + mm / 60;
        timeDiff.value = dest_gmt - selectedDeparture.value.GMT;
    } else {
        timeDiff.value = null;
    }
});

const timeDiffFormatted = computed(() => {
    const sign = timeDiff.value > 0 ? '+' : '-';
    const abs_diff = Math.abs(timeDiff.value);
    const abs_minutes = (abs_diff % 1) * 60;
    return `${ sign } ${ Math.floor(abs_diff) } ч${ abs_minutes ? ' ' + abs_minutes + ' мин' : '' }`;
});

</script>

<template>
    <div class="infosheet-item timezone">
        <img class="icon" src="/site/coral.ru/assets/icon-time-zone.png">
        <div class="info">
            Разниц{{ timeDiff ? 'а' : 'ы' }} во времени
            <strong v-if="timeDiff">{{ timeDiffFormatted }}</strong>
            <strong v-else>нет</strong>
        </div>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/info-sheet";
strong {
    display: block;
}
</style>