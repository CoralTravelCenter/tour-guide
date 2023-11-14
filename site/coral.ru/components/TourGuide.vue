<script setup>
import BackdropScene from "./BackdropScene.vue";
import ControlPane from "./ControlPane.vue";
import { provide, ref } from "vue";

const backdropSolidFill = ref('black');

provide('backdrop', { backdropSolidFill });

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

}
</style>