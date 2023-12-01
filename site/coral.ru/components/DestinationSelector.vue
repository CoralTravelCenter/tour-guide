<script setup>
import ChoiceGrid from "./ChoiceGrid.vue";
import { useStepBehaviour } from "./step-behaviour";
import { computed, inject, ref } from "vue";
import ModeSwitch from "./ModeSwitch.vue";
import DestinationInfoSheet from "./DestinationInfoSheet.vue";

const config = useStepBehaviour();

const layoutMode = inject('layout-mode');

const $el = ref();

const someOpts = [
    { label: 'Opt1', value: 1 },
    { label: 'Opt2', value: 2 }
];
const selected_value = ref();

const { destinationSelectorMode } = inject('destination-selector');
const paneBackground = computed(() => destinationSelectorMode.value === 'list' ? 'white' : 'transparent');

</script>

<template>
    <div ref="$el" class="destination-selector">
        <div class="switchers">
            <div class="controls">
                <el-select v-model="selected_value">
                    <el-option v-for="opt in someOpts"
                               :key="opt.value"
                               :label="opt.label"
                               :value="opt.value"></el-option>
                </el-select>
                <ModeSwitch v-model="destinationSelectorMode" label="Показать"/>
            </div>
        </div>
        <div class="view-mode">
            <Transition>
                <div v-if="destinationSelectorMode === 'list'" class="list-view">
                    <h3 v-if="config.h3">{{ config.h3 }}</h3>
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
        grid-template-columns: 1fr;
        justify-content: center;
        h3 {
            text-align: center;
        }
    }
}
</style>