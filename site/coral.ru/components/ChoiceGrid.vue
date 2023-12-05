<script setup>
import { inject } from "vue";
import ChoiceItem from "./ChoiceItem.vue";
import { asapTimeframe, choiceLeadsToDeadEnd, in2monthsTimeframe } from "./predefined-actions";
import { destinations } from "../config/tour-guide";

const props = defineProps(['behaviour', 'trait', 'layout']);

const { stepByKey } = inject('flow-control');
const stepConfig = inject('current-step-config');

if (stepConfig.value.behaviour?.resetSelection) {
    stepConfig.value.choices.forEach(choice => choice.selected = false);
}

const preferredSearchParams = inject('preferred-search-params');
const lowBudgetRange = inject('lowBudgetRange');
const mediumBudgetRange = inject('mediumBudgetRange');
const highBudgetRange = inject('highBudgetRange');

const { backdropStack } = inject('backdrop');

function handleChoiceHover(choice) {
    if (stepConfig.value.behaviour?.selectOnHover) {
        choice.selected = true;
        if (stepConfig.value.behaviour?.singleChoice) {
            for (const c of stepConfig.value.choices) {
                if (c !== choice) c.selected = false;
            }
        }
        handleChoiceSelect(choice, 'dont-step');
    }
}
function handleChoiceSelect(choice, dont_step) {
    choice.selected = stepConfig.value.behaviour?.toggle ? !choice.selected : true;
    if (stepConfig.value.behaviour?.singleChoice) {
        for (const c of stepConfig.value.choices) {
            if (c !== choice) c.selected = false;
        }
    }
    for (const action of choice.actions ?? []) {
        if (choice.selected) {
            switch (action.what) {
                case 'setPreferredTimeframe':
                    if (action.predefined === 'asap') {
                        Object.assign(preferredSearchParams.timeframe, asapTimeframe());
                    } else if (action.predefined === 'in2months') {
                        Object.assign(preferredSearchParams.timeframe, in2monthsTimeframe());
                    }
                    break;
                case 'setPreferredBudget':
                    Object.assign(preferredSearchParams.budget, this[action.predefined]);
                    break;
                case 'setMaxFlightDuration':
                    preferredSearchParams.maxFlightDuration = action.predefined;
                    break;
                case 'setBackdrop':
                    backdropStack.splice(0, backdropStack.length, action.predefined);
                    break;
                case 'toggleBackdrop':
                    let idx = backdropStack.indexOf(backdropStack.find(backdrop => backdrop.key === action.predefined.key));
                    if (idx < 0) {
                        if (stepConfig.value.choices.filter(c => !!c.selected).length === 1) {
                            backdropStack.splice(0, 1);
                        }
                        backdropStack.push(action.predefined);
                    }
                    break;
            }
        } else {
            switch (action.what) {
                case 'toggleBackdrop':
                    let idx = backdropStack.indexOf(backdropStack.find(backdrop => backdrop.key === action.predefined.key));
                    if (~idx && backdropStack.length > 1) {
                        backdropStack.splice(idx, 1);
                    }
                    break;
            }
        }
    }
    if (choice.step && !dont_step) {
        stepByKey(choice.step);
    }
}

</script>

<template>
    <div class="choice-grid" :class="{ [layout]: true }">
        <ChoiceItem v-for="choice in stepConfig.choices"
                :config="choice"
                :class="{
                    [trait]: true,
                    selected: choice.selected && !(choice.disabled || choiceLeadsToDeadEnd(choice, destinations, preferredSearchParams)),
                    disabled: choice.disabled || choiceLeadsToDeadEnd(choice, destinations, preferredSearchParams)
                }"
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
    &.kind-grid {
        flex-direction: row;
        flex-wrap: wrap;
        font-size: (13/20em);
        gap: unset;
        > button {
            flex: 1 1 (30%);
            padding: 0 1em;
            &:nth-child(3n+2), &:nth-child(3n+3) {
                margin-left: 1em;
            }
            &:nth-child(3n+1):last-child {
                margin-left: auto;
                margin-right: auto;
                flex-grow: 0;
                white-space: nowrap;
            }
            &:nth-child(n+4) {
                margin-top: 1em;
            }
        }
    }
    &.destinations-grid {
        align-self: center;
        flex-direction: row;
        flex-wrap: wrap;
        font-size: (13/20em);
        gap: unset;
        padding: 0 1.7em;
        > button {
            flex: 1 1 (20%);
            padding: 0 1em;
            &:nth-child(4n+2), &:nth-child(4n+3), &:nth-child(4n+4) {
                margin-left: 1em;
            }
            &:nth-child(n+5) {
                margin-top: 1em;
            }
        }
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
            @media screen and (max-width: @narrow-breakpoint) {
                box-shadow: inset 0 0 1px 1px currentColor;
            }
            &:hover:not(:focus), &:active, &.selected {
                background: @coral-ramp-bg;
                color: white;
                box-shadow: none;
            }
        }
        &.disabled {
            pointer-events: none;
            color: @coral-page-bg;
        }
    }
}
</style>