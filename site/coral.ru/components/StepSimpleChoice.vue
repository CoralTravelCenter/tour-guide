<script setup>
import ChoiceGrid from "./ChoiceGrid.vue";
import { useStepBehaviour } from "./step-behaviour";

const props = defineProps({ config: Object });

useStepBehaviour(props);

</script>

<template>
    <div class="step-simple-choice">
        <h2 v-if="config.h2">{{ config.h2 }}</h2>
        <h3 v-if="config.h3">{{ config.h3 }}</h3>
        <ChoiceGrid :choices="config.choices" trait="ramp-hover"/>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.step-simple-choice {
    background-color: white;
    border-radius: 1em;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    text-align: center;
    padding: 1em 3em;
    @media screen and (max-width: @mobile-breakpoint) {
        gap: 1em;
    }
    h2 {
        color: @coral-main-yellow;
    }
}
</style>