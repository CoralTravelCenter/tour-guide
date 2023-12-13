<script setup>
import YandexMap from "./YandexMap";
import { inject, onMounted, ref, watch } from "vue";

const layoutMode = inject('layout-mode');
const { selectedDestination } = inject('destination-selector');
const stepConfig = inject('current-step-config');
const { departures, selectedDeparture } = inject('departures');

const $el = ref();

const locked = ref(true);

let yandexMap;
let mapArea;

onMounted(async () => {
    console.log('+++ MAP mounted');
    window.yandexMap = yandexMap = new YandexMap($el.value, {
        departures
    });
    await yandexMap.init();
    if (layoutMode.value === 'desktop') mapArea = yandexMap.ymap.margin.addArea({ top: 0, right: 0, width: '40%', height: '100%' });
    locked.value = false;
});

watch(layoutMode, (mode) => {
    mapArea?.remove();
    if (mode === 'desktop') mapArea = yandexMap.ymap.margin.addArea({ top: 0, right: 0, width: '40%', height: '100%' });
});

</script>

<template>
    <div class="interactive-map">
        <div ref="$el" id="ymap"></div>
        <Transition name="fade">
            <div v-if="locked" class="lock-screen"><span class="spinner"></span></div>
        </Transition>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.interactive-map {
    .abs100x100();
    #ymap {
        .abs100x100();
        .transit(opacity);
        &.map-enter-from, &.map-leave-to {
            opacity: 0;
        }
    }
    .lock-screen {
        .abs100x100();
        background: fade(white, 50%);
        display: grid;
        place-content: center;
        cursor: progress;
        .transit(opacity);
        .spinner {
            .loader(@size: 3em, @thickness: 10px, @color: @coral-main-blue-accent);
        }
        &.fade-enter-from, &.fade-leave-to {
            opacity: 0;
        }
    }
}
</style>