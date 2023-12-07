<script setup>

import { computed, inject, onMounted, ref, watchEffect } from "vue";
import { fetchAvailableFlights } from "./api-adapter";

const props = defineProps({ config: Object });
defineEmits(['selected']);

const $el = ref();
const state = ref();

const { selectedDeparture } = inject('departures');
const preferredSearchParams = inject('preferred-search-params');

const isDisabled = computed(() => $el.value?.classList.contains('disabled'));

async function determineState() {
    state.value = 'indeterminate';
    const flightsList = await fetchAvailableFlights(selectedDeparture.value, props.config.destination);
    if (preferredSearchParams.timeframe.startMoment && preferredSearchParams.timeframe.endMoment) {
        state.value = flightsList.some(flight => {
            return moment(Number(flight.timestamp)).isBetween(preferredSearchParams.timeframe.startMoment, preferredSearchParams.timeframe.endMoment);
        }) ? 'available' : 'unavailable';
    } else {
        state.value = flightsList.length ? 'available' : 'unavailable';
    }

}

watchEffect(() => {
    selectedDeparture.value && !isDisabled.value && determineState();
}, { flush: 'post' });

onMounted(() => {

});

</script>

<template>
    <button ref="$el" v-if="config.label"
            class="destination-button"
            :class="{ [state]: true }"
            @click="$emit('selected')">
        <span class="state-icon">
            <span v-if="state === 'indeterminate'" class="indeterminate"></span>
            <span v-else-if="state === 'available'" class="available">airplanemode_on</span>
            <span v-else-if="state === 'unavailable'" class="unavailable">airplanemode_off</span>
        </span>
        <span class="label">{{ config.label }}</span>
    </button>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.destination-button {
    display: inline-grid!important;
    padding: 0 .5em!important;
    grid-template-columns: auto 1fr;
    justify-items: self-start;
    gap: 0.25em;
    &:hover, &.selected {
        &.unavailable {
            background: linear-gradient(46deg, #6BDCFF, #13A0F0)!important;
        }
        .state-icon {
            .available, .unavailable {
                color: inherit!important;
            }
            .indeterminate {
                .loader(@size: 1em, @thickness: 2px, @color: white);
            }
        }
    }
    .state-icon {
        .indeterminate {
            display: block;
            .loader(@size: 1em, @thickness: 2px, @color: @coral-main-blue);
        }
        .available {
            font-family: "Material Icons";
            color: @coral-green-accent;
            font-size: 1em;
        }
        .unavailable {
            font-family: "Material Icons";
            color: @coral-red-error;
            font-size: 1em;
        }
    }
}
</style>