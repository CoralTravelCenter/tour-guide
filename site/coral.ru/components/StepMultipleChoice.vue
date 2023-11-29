<script setup>
import ChoiceGrid from "./ChoiceGrid.vue";
import { useStepBehaviour } from "./step-behaviour";
import { computed, inject } from "vue";

const config = useStepBehaviour();

const h2MobilePlaceholder = inject('h2-mobile-placeholder');
const layoutMode = inject('layout-mode');
const isDesktopLayout = computed(() => layoutMode.value === 'desktop');

</script>

<template>
    <div class="step-multiple-choice">
        <Teleport :to="h2MobilePlaceholder" :disabled="isDesktopLayout">
            <h2 v-if="config.h2">{{ config.h2 }}</h2>
        </Teleport>
        <h3 v-if="config.h3">{{ config.h3 }}</h3>
        <div v-if="config.hint" class="hint">{{ config.hint }}</div>
        <ChoiceGrid trait="ramp-hover" layout="kind-grid"/>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.step-multiple-choice {
    background-color: white;
    border-radius: 1em;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    text-align: center;
    padding: 1em 1.5em;
    @media screen and (max-width: @mobile-breakpoint) {
        gap: 1em;
        padding: 2em 1.5em;
    }
    h2 {
        color: @coral-main-yellow;
    }
    .hint {
        font-size: (14/20em);
    }
}
</style>