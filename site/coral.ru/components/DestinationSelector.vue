<script setup>
import ChoiceGrid from "./ChoiceGrid.vue";
import ModeSwitch from "./ModeSwitch.vue";
import { useStepBehaviour } from "./step-behaviour";
import { computed, inject, ref } from "vue";
import DestinationInfoSheet from "./DestinationInfoSheet.vue";

const config = useStepBehaviour();

const layoutMode = inject('layout-mode');

const $el = ref();

const { destinationSelectorMode } = inject('destination-selector');
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

</script>

<template>
    <div ref="$el" class="destination-selector">
        <div class="switchers">
            <div class="controls">
                <el-select v-model="selectedDeparture" value-key="eeID" filterable :filter-method="input => departureInputPattern = input">
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
                    <ChoiceGrid trait="ramp-hover" layout="destinations-grid"/>
                    <DestinationInfoSheet/>
                </div>
                <div v-else class="map-view">MAP</div>
            </Transition>
        </div>
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
            width: 100%;
            justify-content: space-between;
            align-items: center;
            font-size: (14/20em);
        }
    }
    .view-mode {
        background: white;
        border-radius: 1em;
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
}
</style>