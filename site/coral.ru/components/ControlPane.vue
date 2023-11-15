<script setup>
import ProgressNavigation from "./ProgressNavigation.vue";

defineProps(['stepConfig']);

</script>

<template>
    <div class="control-pane">
        <Component :is="stepConfig.instance" :config="stepConfig"/>
        <ProgressNavigation v-if="stepConfig.progress"/>
    </div>
</template>

<style scoped lang="less">
.control-pane {
    display: flex;
    flex-direction: column;
    z-index: 1;
    grid-area: 1 / 2 / span 3 / span 2;
    filter: drop-shadow(0 8px 16px fade(black, 20%));
    border-radius: 1em;
    >* {
        width: 100%;
        &:first-child {
            flex-grow: 1;
        }
    }
}
</style>