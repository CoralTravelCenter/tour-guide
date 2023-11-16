<script setup>

</script>

<template>
    <div class="progress-navigation">progress</div>
</template>

<style scoped lang="less">
@import "../common/css/layout";
.progress-navigation {
    overflow: hidden;
    width: 100%;
    display: flex;
    background-color: white;
    border-radius: 1em;
    height: (66/20em);
    margin-top: 1em;
    .transit(all);
    &.slide-enter-from, &.slide-leave-to {
        margin-top: 0;
        height: 0;
    }
}
</style>