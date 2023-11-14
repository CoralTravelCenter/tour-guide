<script setup>
import BackdropScene from "./BackdropScene.vue";
import ControlPane from "./ControlPane.vue";


</script>

<template>
    <div class="tour-guide-module">
        TourGuide component template
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

    border: 1px solid red;
    font-family: museosans;
    font-weight: normal;
}
</style>