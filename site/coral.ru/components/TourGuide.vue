<script setup async>
import BackdropScene from "./BackdropScene.vue";
import ControlPane from "./ControlPane.vue";
import { computed, onMounted, provide, reactive, ref } from "vue";

import tourGuideConfig from '../config/decision-tree.yaml'
import { highBudgetLabel, lowBudgetLabel, mediumBudgetLabel } from "./predefined-actions.js";

const tourGuideSteps = reactive(tourGuideConfig.steps);

const preferredSearchParams = reactive({
    timeframe: {
        startMoment: null,
        endMoment: null,
        selectedMoment: null
    }
});
provide('preferred-search-params', preferredSearchParams);

const currentStepConfig = ref(Object.values(tourGuideSteps).find(step => !!step.root));
provide('current-step-config', currentStepConfig);
const breadcrumbs = [currentStepConfig.value];

const backdropSolidFill = ref('transparent');
const backdropStack = reactive([]);
const foregroundStack = computed(() => {
    return currentStepConfig.value.choices
        .filter(choice => choice.selected && choice.foreground)
        .map(choice => choice.foreground);
});
provide('backdrop', { backdropSolidFill, backdropStack, foregroundStack });

const layoutMode = ref('');
provide('layout-mode', layoutMode);

function stepByKey(key) {
    const step_config = tourGuideSteps[key];
    if (step_config) {
        currentStepConfig.value = step_config;
        breadcrumbs.push(step_config);
    }
}

function stepBack() {
    if (breadcrumbs.length > 1) {
        breadcrumbs.pop();
        currentStepConfig.value = breadcrumbs.at(-1);
    }
}
provide('flow-control', { stepByKey, stepBack });

const h2MobilePlaceholder = ref(null);
provide('h2-mobile-placeholder', h2MobilePlaceholder);

provide('lowBudgetLabel', await lowBudgetLabel());
provide('mediumBudgetLabel', await mediumBudgetLabel());
provide('highBudgetLabel', await highBudgetLabel());

onMounted(() => {
    const layout = matchMedia('(max-width:768px)');
    layout.addEventListener('change', e => layoutMode.value = e.matches ? 'mobile' : 'desktop');
    layoutMode.value = layout.matches ? 'mobile' : 'desktop';
});

</script>

<template>
    <div class="tour-guide-module">
        <div ref="h2MobilePlaceholder" class="h2-mobile-placeholder"></div>
        <BackdropScene/>
        <ControlPane/>
    </div>
</template>

<style lang="less">
@import "../common/css/coral-fonts";
@import "../common/css/coral-colors";
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
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 2.5em 2em;
        grid-area: 1 / 1 / span 1 / span 1;
        z-index: 1;
        :deep(h2) {
            font-size: 2em;
        }
    }

}
</style>