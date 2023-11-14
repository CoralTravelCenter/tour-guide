<script setup>

import { inject } from "vue";

const { backdropSolidFill } = inject('backdrop');

</script>

<template>
    <div class="backdrop-scene">
        <div class="contenu"></div>
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
}
</style>