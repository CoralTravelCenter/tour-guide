<script setup>
import ChoiceGrid from "./ChoiceGrid.vue";
import ModeSwitch from "./ModeSwitch.vue";
import DestinationInfoSheet from "./DestinationInfoSheet.vue";
import { useStepBehaviour } from "./step-behaviour";
import { computed, inject, provide, ref } from "vue";
import DestinationVisual from "./DestinationVisual.vue";
import InteractiveMap from "./InteractiveMap.vue";

const config = useStepBehaviour();

const layoutMode = inject('layout-mode');

const $el = ref();

const { selectedDestination, destinationSelectorMode } = inject('destination-selector');
const selectedDestinationName = computed(() => selectedDestination.value?.name || '');
const paneBackground = computed(() => destinationSelectorMode.value === 'list' ? 'white' : 'transparent');

const { departures, selectedDeparture } = inject('departures');

const matchedDepartures = computed(() => {
    return departures.filter(dep => {
        const pattern_input = departureInputPattern.value?.trim();
        if (pattern_input) {
            const words_uc = pattern_input.toUpperCase().split(/\s+/);
            const dep_name_words_uc = (dep.correctName || dep.name).toUpperCase().split(/\s+/);
            return words_uc.reduce((matched, word) => {
                if (!matched) return false;
                const idx = dep_name_words_uc.findIndex(dep_word => dep_word.indexOf(word) === 0);
                if (~idx) {
                    dep_name_words_uc.splice(idx, 1);
                    return true;
                }
                return false;
            }, true);
        }
        return true;
    });
});

const departureInputPattern = ref();

const mapPlaceholderEl = inject('map-placeholder-el');

const tooltipRef = ref();
const tooltipVisible = ref(false);
const tooltipButtonRef = ref();
provide('tooltip', { tooltipRef, tooltipVisible, tooltipButtonRef });

</script>

<template>
    <div ref="$el" class="destination-selector">
        <div class="switchers">
            <div class="controls">
                <el-select v-model="selectedDeparture" value-key="eeID"
                           default-first-option
                           filterable
                           :filter-method="input => departureInputPattern = input">
                    <template #header>Город вылета</template>
                    <template #empty><div style="text-align:center; padding: 1em;">Не найден</div></template>
                    <el-option v-for="departure in matchedDepartures"
                               :key="departure.eeID"
                               :label="`из ${ departure.fromForm }`"
                               :value="departure">
                        <span>{{ departure.correctName || departure.name }}</span>
                    </el-option>
                </el-select>
                <ModeSwitch v-model="destinationSelectorMode" label="Показать"/>
            </div>
        </div>
        <div class="view-mode">
            <Transition>
                <div v-if="destinationSelectorMode === 'list'" class="list-view">
                    <h3 v-if="config.h3">{{ config.h3 }}</h3>
                    <ChoiceGrid trait="ramp" layout="destinations-grid"/>
                    <el-tooltip ref="tooltipRef" :visible="tooltipVisible"
                                placement="top"
                                effect="light"
                                virtual-triggering
                                :virtual-ref="tooltipButtonRef"
                                popper-class="singleton-tooltip"
                                :popper-options="{ modifiers: [ { name: 'computeStyles', options: { adaptive: false, enabled: false, } } ] }">
                        <template #content>
                            Без перелета, <strong>только проживание</strong>
                        </template>
                    </el-tooltip>
                    <DestinationInfoSheet/>
                </div>
                <div v-else class="map-view">
                    <DestinationVisual/>
                    <h3>{{ selectedDestinationName }}</h3>
                    <DestinationInfoSheet/>
                </div>
            </Transition>
        </div>
        <Teleport :to="mapPlaceholderEl">
            <Transition name="map">
                <InteractiveMap v-if="destinationSelectorMode === 'map' "/>
            </Transition>
        </Teleport>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/layout";
.destination-selector {
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 1em;
    border-radius: 1em;
    background-color: v-bind(paneBackground);
    .transit(background-color);
    .switchers {
        background: white;
        border-radius: 1em;
        padding: .7em 1em;
        .controls {
            display: flex;
            gap: 2em;
            width: 100%;
            justify-content: space-between;
            align-items: center;
            font-size: (14/20em)!important;
            > * {
                flex: 1;
            }
        }
    }
    .view-mode {
        background: white;
        border-radius: 1em;
        overflow: hidden;
    }
    .list-view {
        display: grid;
        height: 100%;
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr auto;
        justify-content: center;
        h3 {
            text-align: center;
        }
    }
    .map-view {
        height: 100%;
        display: grid;
        gap: 1em;
        grid-template-areas: "visual name" "visual sheet";
        grid-template-columns: 57fr 43fr;
        .destination-info-visual {
            grid-area: visual;
        }
        h3 {
            grid-area: name;
            align-self: end;
            @media screen and (max-width: @mobile-breakpoint) {
                margin-top: 1em;
            }
        }
        .info-sheet {
            grid-area: sheet;
        }
    }
}
</style>

<style lang="less">
.singleton-tooltip {
    font-family: museosans;
    font-size: 11px;
    line-height: 1.2;
    letter-spacing: normal;
    text-align: center;
    transition: transform 0.3s var(--el-transition-function-fast-bezier);
    margin-top: .5em!important;
    filter: drop-shadow(0 2px 4px fade(black,15%));
    strong {
        display: block;
        line-height: inherit;
    }
}
</style>