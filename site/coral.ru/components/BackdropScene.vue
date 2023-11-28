<script setup>

import { inject } from "vue";
import ForegroundStack from "./ForegroundStack.vue";

const { backdropSolidFill, backdropStack } = inject('backdrop');
const layoutMode = inject('layout-mode');

function backdropVisualStyle(idx, collection) {
    const visible_region_percent = 55;
    const backdrop_url = typeof backdropStack[idx] === 'object' ? backdropStack[idx][layoutMode.value] : backdropStack[idx];
    const css = {
        backgroundImage: `url(${ backdrop_url })`
    };
    if (collection.length > 1) {
        const reduce_by = visible_region_percent / collection.length;
        css.width = `${ 100 - reduce_by * (collection.length - 1) }%`;
        css.left = `${ reduce_by * idx }%`;
    }
    return css;
}

</script>

<template>
    <div class="backdrop-scene">
        <div class="visuals-stack">
            <div class="visual" v-for="(visual, idx) in backdropStack" :style="backdropVisualStyle(idx, backdropStack)"></div>
        </div>
        <div class="foreground">
            <ForegroundStack/>
        </div>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.backdrop-scene {
    .proportional(1440/430);
    background: v-bind(backdropSolidFill);
    grid-area: 2 / 1 / span 1 / span 2;
    border-radius: 1em;
    overflow: hidden;
    .transit(background, .25s);
    @media screen and (max-width: @mobile-breakpoint) {
        .proportional(750/926);
        grid-area: 1 / 1 / span 2 / span 1;
    }
}
.visuals-stack {
    .visual {
        .abs100x100();
        background-repeat: no-repeat;
        background-size: auto 100%;
        background-position: 50% 50%;
        .transit(all, .25s);
        &:nth-child(n+2) {
            border-radius: 1em;
            box-shadow: -.5em 0 32px fade(black, 30%);
        }

    }
}

</style>