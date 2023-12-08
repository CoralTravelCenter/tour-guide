<script setup>

import { computed, inject } from "vue";

const { selectedDestination } = inject('destination-selector');

const requiredOrNot = computed(() => {
    if (selectedDestination?.value?.visa) {
        return selectedDestination?.value?.visa.required ? 'нужна' : 'не нужна';
    }
    return '...';
});

const href = computed(() => {
    if (selectedDestination?.value?.visa) {
        return selectedDestination?.value?.visa.href;
    }
    return false;
});

</script>

<template>
    <component :is="href ? 'a' : 'div'" :href="href" target="_blank" class="infosheet-item visa">
        <img class="icon" src="/site/coral.ru/assets/icon-visa.png">
        <div class="info">
            Виза <strong>{{ requiredOrNot }}</strong>
        </div>
    </component>
</template>

<style scoped lang="less">
@import "../common/css/info-sheet";
strong {
    display: block;
}
</style>