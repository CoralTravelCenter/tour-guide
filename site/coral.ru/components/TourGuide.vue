<script setup async>
import BackdropScene from "./BackdropScene.vue";
import ControlPane from "./ControlPane.vue";
import { computed, onMounted, provide, reactive, ref, watch, watchEffect } from "vue";

import { tourGuideConfig, destinations, departures } from '../config/tour-guide.js'
import { currencyBudget } from "./predefined-actions.js";
import { observeElementProp } from "./usefuls";

const predefinedActions = {
    resetPreferredSearchParams() {
        Object.assign(preferredSearchParams.timeframe, { startMoment: null, endMoment: null, selectedMoment: null });
        Object.assign(preferredSearchParams.budget, { currencyCode: '', currencySymbol: '', min: null, max: null });
        preferredSearchParams.maxFlightDuration = Infinity;
        preferredSearchParams.leisureKinds = [];
        preferredSearchParams.regionFilter = [];
        preferredSearchParams.musthaveFilter = {};
    },
    resetPreferredTimeframe() {
        Object.assign(preferredSearchParams.timeframe, { startMoment: null, endMoment: null, selectedMoment: null });
    },
    resetPreferredBudget() {
        Object.assign(preferredSearchParams.budget, { currencyCode: '', currencySymbol: '', min: null, max: null });
    },
    resetMaxFlightDuration() {
        preferredSearchParams.maxFlightDuration = Infinity;
    },
    resetRegionFilter() {
        preferredSearchParams.regionFilter = []
    },
    resetMusthaveFilter() {
        preferredSearchParams.musthaveFilter = {};
    },
    setPreferredLeisureKindsFromCurrentStep() {
        preferredSearchParams.leisureKinds = currentStepConfig.value.choices.filter(choice => choice.selected).map(choice => choice.kindKey);
    },
    preserveBackdropFromCurrentStep() {
        currentStepConfig.value.setBackdrop.splice(0, currentStepConfig.value.setBackdrop.length, ...backdropStack);
    },
}

const tourGuideSteps = reactive(tourGuideConfig.steps);

const preferredSearchParams = reactive({
    chartersOnly:      false,
    timeframe:         {
        startMoment:    null,
        endMoment:      null,
        selectedMoment: null
    },
    budget:            {
        currencyCode:   '',
        currencySymbol: '',
        min:            null,
        max:            null
    },
    maxFlightDuration: Infinity,
    leisureKinds:      [],
    regionFilter:      [],
    musthaveFilter:    {}
});
provide('preferred-search-params', preferredSearchParams);

const currentStepConfig = ref(Object.values(tourGuideSteps).find(step => !!step.root));
provide('current-step-config', currentStepConfig);
provide('tour-guide-steps', tourGuideSteps);
const breadcrumbs = [currentStepConfig.value];

const backdropSolidFill = ref('transparent');
const backdropStack = reactive([]);
const foregroundStack = computed(() => {
    return currentStepConfig.value.choices
        .filter(choice => choice.selected && choice.foreground)
        .map(choice => choice.foreground);
});
watch(backdropStack, (newStack) => {
    if (newStack.length) {
        h2MobileColor.value = newStack.at(-1)?.h2MobileColor;
    }
});
provide('backdrop', { backdropSolidFill, backdropStack, foregroundStack });

const layoutMode = ref('');
provide('layout-mode', layoutMode);

function performActionsForStep(step_config) {
    if (step_config.behaviour?.proceedWithActions) {
        const actions = Array.isArray(step_config.behaviour?.proceedWithActions)
                        ? step_config.behaviour?.proceedWithActions
                        : [step_config.behaviour?.proceedWithActions];
        for (const action of actions) {
            predefinedActions[action] && predefinedActions[action]();
        }
    }
}
function stepByKey(key) {
    const step_config = tourGuideSteps[key];
    if (step_config) {
        performActionsForStep(breadcrumbs.at(-1));
        currentStepConfig.value = step_config;
        breadcrumbs.push(step_config);
    }
}
function stepBack() {
    const step_config = breadcrumbs.at(-1);
    performActionsForStep(step_config);
    if (step_config.behaviour?.resetOnStepback && predefinedActions[step_config.behaviour?.resetOnStepback]) {
        predefinedActions[step_config.behaviour.resetOnStepback]();
    }
    if (breadcrumbs.length > 1) {
        breadcrumbs.pop();
        currentStepConfig.value = breadcrumbs.at(-1);
    }
}

function skip(key) {
    if (typeof predefinedActions[currentStepConfig.value.behaviour?.resetSelection] === 'function') {
        predefinedActions[currentStepConfig.value.behaviour?.resetSelection]();
    }
    stepByKey(key);
}
provide('flow-control', { stepByKey, stepBack, skip });

const h2MobilePlaceholder = ref(null);
provide('h2-mobile-placeholder', h2MobilePlaceholder);
const h2MobileColor = ref('inherit');

const { budget, code: currencyCode, symbol: currencySymbol } = await currencyBudget();
provide('lowBudgetLabelMarkup', budget.low.labelMarkup);
provide('lowBudgetRange', { currencyCode, currencySymbol, min: budget.low.min, max: budget.low.max });
provide('mediumBudgetLabelMarkup', budget.medium.labelMarkup);
provide('mediumBudgetRange', { currencyCode, currencySymbol, min: budget.medium.min, max: budget.medium.max });
provide('highBudgetLabelMarkup', budget.high.labelMarkup);
provide('highBudgetRange', { currencyCode, currencySymbol, min: budget.high.min, max: budget.high.max });

const destinationSelectorMode = ref('list');
const selectedDestination = ref();
const destinationRussia = computed(() => selectedDestination.value?.id === 'russia');

provide('destination-selector', { destinationSelectorMode, selectedDestination, destinationRussia });

const mapPlaceholderEl = ref();
provide('map-placeholder-el', mapPlaceholderEl);

watchEffect(() => {
    // Setup/config "dont-know-where-destination-selector"
    let step_config = tourGuideSteps['dont-know-where-destination-selector'];
    let choices = destinations.map(dest => {
        const all_kinds = [].concat(dest.leisureKinds, preferredSearchParams.leisureKinds);
        const exclude_by_flight_duration = !!dest.flightDuration && dest.flightDuration > preferredSearchParams.maxFlightDuration;
        const exclude_by_budget = !(currencyCode && dest.budgetLevel[currencyCode] && preferredSearchParams.budget.max
            ? (dest.budgetLevel[currencyCode] <= preferredSearchParams.budget.max) : true);
        const exclude_by_kind = (preferredSearchParams.leisureKinds.length > 0) && (all_kinds.length === new Set(all_kinds).size);
        const exclude = exclude_by_kind || exclude_by_flight_duration || exclude_by_budget;
        return {
            is: 'DestinationButton',
            destination: dest,
            label: dest.name,
            selected: dest.selected && !exclude,
            disabled: exclude,
            step: 'must-have',
            actions: [
                { what: 'setBackdrop', predefined: dest.backdropVisual },
                { what: 'setSelectedDestination', predefined: dest }
            ]
        };
    });
    step_config.choices = choices;
    let choice2select = selectedDestination.value && choices.find(choice => !choice.disabled && choice.destination.eeID === selectedDestination.value.eeID);
    choice2select ||= choices.find(choice => !choice.disabled);
    choice2select.selected = true;
    let backdrop = choice2select.actions.find(action => action.what === 'setBackdrop').predefined;
    step_config.setBackdrop = [backdrop];

    // Setup/config "know-where-destination-selector"
    step_config = tourGuideSteps['know-where-destination-selector'];
    choices = destinations.map(dest => {
        const exclude_by_budget = !(currencyCode && dest.budgetLevel[currencyCode] && preferredSearchParams.budget.max
                                    ? (dest.budgetLevel[currencyCode] <= preferredSearchParams.budget.max) : true);
        return {
            is: 'DestinationButton',
            destination: dest,
            label: dest.name,
            selected: dest.selected && !exclude,
            disabled: exclude_by_budget,
            step: dest.knowWhereStep,
            actions: [
                { what: 'setBackdrop', predefined: dest.backdropVisual },
                { what: 'setSelectedDestination', predefined: dest }
            ]
        };
    });
    step_config.choices = choices;
    choice2select = selectedDestination.value && choices.find(choice => !choice.disabled && choice.destination.eeID === selectedDestination.value.eeID);
    choice2select ||= choices.find(choice => !choice.disabled);
    choice2select.selected = true;
    backdrop = choice2select.actions.find(action => action.what === 'setBackdrop').predefined;
    step_config.setBackdrop = [backdrop];
});

const { value: departureCityId } = window.global.getActiveDeparture();
const selectedDeparture = ref(
    departures.find(dep=>Number(dep.eeID) === Number(departureCityId)) ?? departures[0]
);
observeElementProp(document.querySelector('input.packageSearch__departureInput'), 'value', (new_departure_name) => {
    if (new_departure_name) {
        const found_departure = departures.find(dep => dep.name === new_departure_name);
        if (found_departure) selectedDeparture.value = found_departure;
    }
});
provide('departures', { departures, selectedDeparture });

onMounted(() => {
    const layout = matchMedia('(max-width:768px)');
    layout.addEventListener('change', e => layoutMode.value = e.matches ? 'mobile' : 'desktop');
    layoutMode.value = layout.matches ? 'mobile' : 'desktop';
});

</script>

<template>
    <div class="tour-guide-module">
        <div ref="h2MobilePlaceholder" class="h2-mobile-placeholder" :style="{ color: h2MobileColor }"></div>
        <BackdropScene/>
        <ControlPane/>
    </div>
</template>

<style lang="less">
@import "../common/css/coral-fonts";
@import "../common/css/coral-colors";

:root {
    --el-font-family: 'museosans'!important;
    --el-font-size-base: inherit!important;
    --el-component-size: 2.5em!important;
}

.el-select-dropdown {
    font-family: museosans;
    font-weight: 400;
    --el-color-primary: @coral-main-blue;
    //--el-text-color-regular: black;
}

.tour-guide-module {
    .el-select {
        --el-select-border-color-hover: @coral-main-blue;
        .el-input__wrapper {
            --el-input-border-color: @coral-page-bg;
            box-shadow: inset 0 0 0 2px var(--el-input-border-color);
        }
    }
}

</style>

<style scoped lang="less">
@import "../common/css/layout";
.tour-guide-module {
    .bbox();
    .silly-b2c-font-size();

    font-family: museosans;
    font-weight: normal;

    display: grid;
    grid-template-columns: 62fr 38fr 1.5em;
    grid-template-rows: 1.5em auto 1.5em;
    @media screen and (max-width: @mobile-breakpoint) {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1.5em auto;
    }

    :deep(p) {
        margin: unset;
    }

    :deep(h2) {
        font-size: (32/20em);
        font-weight: 700;
        margin: unset;
    }
    :deep(h3) {
        font-size: (24/20em);
        font-weight: 700;
        margin: unset;
    }

    .h2-mobile-placeholder {
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 2.5em 2em;
        grid-area: 1 / 1 / span 1 / span 1;
        z-index: 1;
        :deep(h2) {
            font-size: 2em;
            color: inherit;
            .transit(color);
        }
    }

}
</style>