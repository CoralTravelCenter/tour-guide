<script setup>
import BackdropScene from "./BackdropScene.vue";
import ControlPane from "./ControlPane.vue";
import { onMounted, provide, reactive, ref } from "vue";

import tourGuideConfig from '../config/decision-tree.yaml'

const tourGuideSteps = reactive(tourGuideConfig.steps);

const currentStepConfig = ref(Object.values(tourGuideSteps).find(step => !!step.root));
provide('current-step-config', currentStepConfig);
const breadcrumbs = [currentStepConfig.value];

const backdropSolidFill = ref('transparent');
const backdropStack = reactive([]);
provide('backdrop', { backdropSolidFill, backdropStack });

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

onMounted(() => {
    const layout = matchMedia('(max-width:768px)');
    layout.addEventListener('change', e => layoutMode.value = e.matches ? 'mobile' : 'desktop');
    layoutMode.value = layout.matches ? 'mobile' : 'desktop';
});

</script>

<template>
    <div class="tour-guide-module">
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

}
</style>