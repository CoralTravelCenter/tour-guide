<script setup>
import YandexMap from "./YandexMap";
import { computed, inject, onMounted, ref, watch, watchEffect } from "vue";

const preferredSearchParams = inject('preferred-search-params');
const layoutMode = inject('layout-mode');
const stepConfig = inject('current-step-config');
const { selectedDestination } = inject('destination-selector');
const availableDestinations = computed(() => {
    return Array.from((function* (choices) {
        for (const choice of choices) {
            if (!choice.disabled) yield choice.destination;
        }
    })(stepConfig.value.choices));
});
const { departures, selectedDeparture } = inject('departures');

const $el = ref();

const locked = ref(true);

let yandexMap;
let mapArea;

onMounted(async () => {
    console.log('+++ MAP mounted');
    // validate selectedDestination
    let destination_ok;
    if (selectedDestination.value) {
        destination_ok = stepConfig.value.choices.find(choice => choice.destination.eeID === selectedDestination.value.eeID && !choice.disabled);
    }
    if (!destination_ok) {
        selectedDestination.value = availableDestinations.value[0];
    }
    //
    window.yandexMap = yandexMap = new YandexMap($el.value, {
        variant: 1,
        chartersOnly: preferredSearchParams.chartersOnly,
        departures,
        selectedDeparture,
        destinations: availableDestinations.value,
        selectedDestination,
        preferredSearchParams
    });
    await yandexMap.init();
    setTimeout(() => {
        yandexMap.selectDeparture(selectedDeparture.value);
        yandexMap.selectDestination(selectedDestination.value);
        yandexMap.updateRouteInfo(selectedDeparture.value, selectedDestination.value);
    }, 100);
    if (layoutMode.value === 'desktop') mapArea = yandexMap.ymap.margin.addArea({ top: 0, right: 0, width: '40%', height: '100%' });
    locked.value = false;
});

watch(layoutMode, (mode) => {
    mapArea?.remove();
    if (mode === 'desktop') mapArea = yandexMap.ymap.margin.addArea({ top: 0, right: 0, width: '40%', height: '100%' });
});

watchEffect(() => {
    if (selectedDeparture.value) {
        yandexMap?.selectDeparture(selectedDeparture.value);
    }
});
watchEffect(() => {
    if (selectedDestination.value) {
        yandexMap?.selectDestination(selectedDestination.value);
    }
});
watchEffect(() => {
    if (selectedDeparture.value && selectedDestination.value) {
        yandexMap?.updateRouteInfo(selectedDeparture.value, selectedDestination.value);
        // setTimeout(() => {
        //     yandexMap?.setBoundsWith(selectedDeparture.value, selectedDestination.value);
        // }, 100);
    }
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

<style lang="less">
@import (inline) "../config/destination-flags.css";
@import "../common/css/layout";

svg g.g-hint {
    transform: translate(-5%,-3%);
    @media screen and (max-width: @narrow-breakpoint) {
        transform: translate(-25%,-3%);
    }
}

svg foreignObject {
    overflow: visible;
    .flight-info {
        width: fit-content;
        //transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #fff;
        border-radius: 100px;
        line-height: 1;
        padding: .25em .7em;
        border: 2px solid currentColor;
    }
}

</style>
<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";

.placemark-sizing(@base: 11px, @marker-ratio: 1, @marker-scale: 1.85em) {
    font-size: @base;
    margin-left: -(@marker-scale/2);
    @top-margin-divider: if((@marker-ratio = 1), 2, 1);
    margin-top: -((@marker-ratio * @marker-scale) / @top-margin-divider);
    .place-marker {
        font-size: inherit;
        width: @marker-scale;
        height: @marker-ratio * @marker-scale;
    }
    .label {
        font-size: inherit;
        line-height: 1.6em;
        padding: 0;
    }
}

.interactive-map {
    .abs100x100();
    #ymap {
        .abs100x100();
        .transit(opacity);
        &.map-enter-from, &.map-leave-to {
            opacity: 0;
        }

        :deep([data-zoom='3']) {
            .departure-placemark, .destination-placemark {
                font-size: 12px;
            }
        }
        :deep([data-zoom='4']) {
            .departure-placemark, .destination-placemark {
                font-size: 13px;
            }
        }
        :deep([data-zoom='5']) {
            .departure-placemark, .destination-placemark {
                font-size: 14px;
            }
        }
        :deep([data-zoom='6']) {
            .departure-placemark, .destination-placemark {
                font-size: 14px;
            }
        }

        :deep(.departure-placemark) {
            position: relative;
            .placemark-sizing(@base: 11px, @marker-ratio: (43/33));
            .transit(filter);
            &.open, &.selected {
                filter: drop-shadow(1px 2px 2px fade(black, 20%));
                .label {
                    padding: 0 .5em 0 2em;
                    text-indent: 0;
                    opacity: 1;
                }
            }
            &.selected {
                .place-marker {
                    background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzMiIGhlaWdodD0iNDMiIHZpZXdCb3g9IjAgMCAzMyA0MyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Zz48cGF0aCBkPSJNMTYuNTUzNCA0MS42NDRDMTYuNTM1MyA0MS42NTk3IDE2LjUxNzUgNDEuNjc1MiAxNi41IDQxLjY5MDNDMTYuNDgyNSA0MS42NzUyIDE2LjQ2NDcgNDEuNjU5NyAxNi40NDY2IDQxLjY0NEMxNi4wMDQ2IDQxLjI2MDMgMTUuMzcwNSA0MC42OTU1IDE0LjYwODMgMzkuOTc2MUMxMy4wODI1IDM4LjUzNjEgMTEuMDUwMiAzNi40ODMxIDkuMDIwNDkgMzQuMDI5OEM0LjkyMDc5IDI5LjA3NDUgMSAyMi42ODQ4IDEgMTYuNUMxIDcuOTM5NTkgNy45Mzk1OSAxIDE2LjUgMUMyNS4wNjA0IDEgMzIgNy45Mzk1OSAzMiAxNi41QzMyIDIyLjY4NDggMjguMDc5MiAyOS4wNzQ1IDIzLjk3OTUgMzQuMDI5OEMyMS45NDk4IDM2LjQ4MzEgMTkuOTE3NSAzOC41MzYxIDE4LjM5MTcgMzkuOTc2MUMxNy42Mjk1IDQwLjY5NTUgMTYuOTk1NCA0MS4yNjAzIDE2LjU1MzQgNDEuNjQ0Wk0xNi41IDIzLjkwMjhDMjAuNTg4NSAyMy45MDI4IDIzLjkwMjggMjAuNTg4NSAyMy45MDI4IDE2LjVDMjMuOTAyOCAxMi40MTE2IDIwLjU4ODUgOS4wOTcyMSAxNi41IDkuMDk3MjFDMTIuNDExNSA5LjA5NzIxIDkuMDk3MiAxMi40MTE2IDkuMDk3MiAxNi41QzkuMDk3MiAyMC41ODg1IDEyLjQxMTUgMjMuOTAyOCAxNi41IDIzLjkwMjhaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTAyM181KSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMDIzXzUiIHgxPSItMS4xMDA2NSIgeTE9IjQ0LjA5NjkiIHgyPSI0Mi45NDE4IiB5Mj0iMTAuNTE4NCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIHN0b3AtY29sb3I9IiNGQjcwOTkiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGMEFCMTMiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4K");
                }
            }
            .place-marker {
                position: absolute;
                left: -1px;
                top: 0;
                z-index: 1;
                background-size: cover;
                background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzMiIGhlaWdodD0iNDMiIHZpZXdCb3g9IjAgMCAzMyA0MyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Zz48cGF0aCBkPSJNMzIgMTYuNUMzMiAyMi42ODQ4IDI4LjA3OTIgMjkuMDc0NSAyMy45Nzk1IDM0LjAyOThDMjEuOTQ5OCAzNi40ODMxIDE5LjkxNzUgMzguNTM2MSAxOC4zOTE3IDM5Ljk3NjFDMTcuNjI5NSA0MC42OTU1IDE2Ljk5NTQgNDEuMjYwMyAxNi41NTM0IDQxLjY0NEMxNi41MzUzIDQxLjY1OTcgMTYuNTE3NSA0MS42NzUyIDE2LjUgNDEuNjkwM0MxNi40ODI1IDQxLjY3NTIgMTYuNDY0NyA0MS42NTk3IDE2LjQ0NjYgNDEuNjQ0QzE2LjAwNDYgNDEuMjYwMyAxNS4zNzA1IDQwLjY5NTUgMTQuNjA4MyAzOS45NzYxQzEzLjA4MjUgMzguNTM2MSAxMS4wNTAyIDM2LjQ4MzEgOS4wMjA0OSAzNC4wMjk4QzQuOTIwNzkgMjkuMDc0NSAxIDIyLjY4NDggMSAxNi41QzEgNy45Mzk1OSA3LjkzOTU5IDEgMTYuNSAxQzI1LjA2MDQgMSAzMiA3LjkzOTU5IDMyIDE2LjVaTTE2LjUgMjMuOTAyOEMyMC41ODg1IDIzLjkwMjggMjMuOTAyOCAyMC41ODg1IDIzLjkwMjggMTYuNUMyMy45MDI4IDEyLjQxMTYgMjAuNTg4NSA5LjA5NzIxIDE2LjUgOS4wOTcyMUMxMi40MTE1IDkuMDk3MjEgOS4wOTcyIDEyLjQxMTYgOS4wOTcyIDE2LjVDOS4wOTcyIDIwLjU4ODUgMTIuNDExNSAyMy45MDI4IDE2LjUgMjMuOTAyOFoiIGZpbGw9IiMwMDkzRDAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4K");
            }
            .label {
                position: absolute;
                z-index: 0;
                left: 0;
                top: 0;
                overflow: hidden;
                white-space: nowrap;
                background-color: white;
                border-radius: 100px;
                width: fit-content;
                text-indent: -8em;
                opacity: 0;
                .transit(padding, .25s);
                .transit(opacity, .25s);
                .transit(text-indent, .25s);
            }
        }
        :deep(.destination-placemark) {
            position: relative;
            .placemark-sizing(@base: 11px);
            .transit(filter);
            filter: drop-shadow(1px 2px 2px fade(black, 25%));
            &.open, &.selected {
                .label {
                    padding: 0 .5em 0 2em;
                    text-indent: 0;
                    opacity: 1;
                }
            }
            .place-marker {
                position: absolute;
                left: -1px;
                top: 0;
                z-index: 1;
                background-size: cover;
                border-radius: 50%;
            }
            .label {
                position: absolute;
                z-index: 0;
                left: 0;
                top: 0;
                overflow: hidden;
                white-space: nowrap;
                background-color: white;
                border-radius: 100px;
                width: fit-content;
                text-indent: -8em;
                opacity: 0;
                .transit(padding, .25s);
                .transit(opacity, .25s);
                .transit(text-indent, .25s);
            }
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

