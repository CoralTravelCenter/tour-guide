<script setup>
import ProgressNavigation from "./ProgressNavigation.vue";
import { inject } from "vue";

const stepConfig = inject('current-step-config');

</script>

<template>
    <div class="control-pane">
        <Component :is="stepConfig.instance" :key="stepConfig.key"/>
        <Transition name="slide">
            <ProgressNavigation v-if="stepConfig.progress"/>
        </Transition>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.control-pane {
    display: flex;
    flex-direction: column;
    z-index: 1;
    grid-area: 1 / 2 / span 3 / span 2;
    filter: drop-shadow(0 8px 16px fade(black, 20%));
    border-radius: 1em;
    @media screen and (max-width: @mobile-breakpoint) {
        grid-area: 2 / 1 / span 2 / span 1;
        background-color: @coral-tourguide-blue-lite;
    }
    >* {
        width: 100%;
        &:first-child {
            flex-grow: 1;
        }
    }
}
</style>