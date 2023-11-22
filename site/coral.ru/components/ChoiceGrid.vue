<script setup>
import { inject } from "vue";
import ChoiceItem from "./ChoiceItem.vue";

const props = defineProps(['behaviour', 'trait']);

const { stepByKey } = inject('flow-control');
const stepConfig = inject('current-step-config');

function handleChoiceHover(choice) {
    if (stepConfig.value.behaviour?.selectOnHover) {
        choice.selected = true;
        if (stepConfig.value.behaviour?.singleChoice) {
            for (const c of stepConfig.value.choices) {
                if (c !== choice) c.selected = false;
            }
        }
    }
}
function handleChoiceSelect(choice) {
    choice.selected = true;
    if (stepConfig.value.behaviour?.singleChoice) {
        for (const c of stepConfig.value.choices) {
            if (c !== choice) c.selected = false;
        }
    }
    if (choice.action) {

    }
    if (choice.step) {
        stepByKey(choice.step);
    }
}

</script>

<template>
    <div class="choice-grid">
        <ChoiceItem v-for="choice in stepConfig.choices"
                :config="choice"
                :class="{ [trait]: true, selected: choice.selected }"
                @mouseenter="handleChoiceHover(choice)"
                @selected="handleChoiceSelect(choice)">{{ choice.label }}</ChoiceItem>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.choice-grid {
    width: 100%;
    display: flex;
    gap: 1em;
    flex-direction: column;
    align-items: stretch;
    > * {
        height: (48/20em);
    }
    > button {
        .interactive();
        outline: none;
        border: 0;
        font-family: inherit;
        line-height: 1;
        font-size: inherit;
        color: black;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        padding: 0 1.5em;
        border-radius: .5em;
        cursor: pointer;
        .transit(background);
        &.accented {
            background-color: @coral-main-yellow;
            color: white;
            font-weight: bold;
        }
        &.ramp-hover {
            background: linear-gradient(0deg, transparent, transparent);
            box-shadow: inset 0 0 0 2px currentColor;
            .transit(background);
            &:hover, &.selected {
                background: @coral-ramp-bg;
                color: white;
                box-shadow: none;
            }
        }
    }
}
</style>