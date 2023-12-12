<script setup>
import YandexMap from "./YandexMap";
import { onMounted, ref } from "vue";

const $el = ref();

let yandexMap;

onMounted(() => {
    console.log('+++ MAP mounted');
    yandexMap = new YandexMap($el.value);
    yandexMap.init();
});


</script>

<template>
<div ref="$el" id="ymap"></div>
</template>

<style scoped lang="less">
@import "../common/css/layout";
#ymap {
    //background-color: fade(red, 50%);
    //border: 20px solid fade(red, 80%);

    .abs100x100();

    .transit(opacity);
    &.map-enter-from, &.map-leave-to {
        opacity: 0;
    }
}
</style>