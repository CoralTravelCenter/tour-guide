<script setup>
import { computed, inject } from "vue";

const { selectedDestination, destinationSelectorMode } = inject('destination-selector');
const selectedDestinationImage = computed(() => selectedDestination.value?.backdropVisual.mobile || null);

</script>

<template>
    <div class="destination-info-visual">
        <Transition>
            <img v-if="selectedDestinationImage" :src="selectedDestinationImage" :key="selectedDestinationImage">
        </Transition>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/layout";
.destination-info-visual {
    position: relative;
    >img {
        .abs100x100();
        object-fit: cover;
        border-radius: 1em;
        box-shadow: 2px 0 16px fade(black, 15%);
    }
}
</style>