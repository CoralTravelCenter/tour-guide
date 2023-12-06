<script setup>

import { inject } from "vue";
import ForegroundStack from "./ForegroundStack.vue";
import VimeoBackground from "./VimeoBackground.vue";

const { backdropSolidFill, backdropStack } = inject('backdrop');
const layoutMode = inject('layout-mode');

function backdropVisualStyle(idx, collection) {
    const visual = collection.at(idx);
    const visible_region_percent = 55;
    const picture_url = typeof visual[layoutMode.value] === 'object' ? visual[layoutMode.value].posterFrame : visual[layoutMode.value];
    const backdrop_url = typeof visual === 'object' ? picture_url : visual;
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
            <div class="visual" v-for="(visual, idx) in backdropStack" :style="backdropVisualStyle(idx, backdropStack)">
                <VimeoBackground v-if="layoutMode === 'desktop' && visual.desktop?.vimeoId" :vimeo-id="visual.desktop?.vimeoId"/>
                <VimeoBackground v-if="layoutMode === 'mobile' && visual.mobile?.vimeoId" :vimeo-id="visual.mobile?.vimeoId"/>
                <div v-if="visual.marker" class="locatino-marker" :style="{ color: visual.marker.color }">{{ visual.marker.text }}</div>
            </div>
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
        @media screen and (max-width: @mobile-breakpoint) {
            width: 100%!important;
            left: 0!important;
        }
        .locatino-marker {
            display: flex;
            align-items: center;
            position: absolute;
            line-height: 1;
            bottom: 1em;
            left: 4em;
            @media screen and (max-width: @mobile-breakpoint) {
                justify-content: flex-end;
                width: 100%;
                padding: 0 1em;
                left: 0;
                bottom: 2.5em;
            }
            &:before {
                content: 'location_on';
                font-family: "Material Icons";
                font-size: 1.5em;
                margin-right: .1em;
            }
        }
    }
}

</style>