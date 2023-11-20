<script setup>

import { inject } from "vue";

const { foregroundStack } = inject('backdrop');


</script>

<template>
    <div class="foreground-stack">
        <TransitionGroup name="slide-in-out">
            <img v-for="pic in foregroundStack" :src="pic" :key="pic">
        </TransitionGroup>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/layout";
.foreground-stack {
    pointer-events: none;
    .proportional(500/657);
    position: absolute;
    top: auto;
    bottom: 0;
    width: 22%;
    left: 18%;
    @media screen and (max-width: @mobile-breakpoint) {
        width: 75%;
        left: 13%;
    }
    >img {
        .transit(all);
        &.slide-in-out-enter-from, &.slide-in-out-leave-to {
            opacity: 0;
            transform: translateX(-33%);
        }
    }
}
</style>