<script setup>
import TimeframePicker from "./TimeframePicker.vue";

const props = defineProps({ config: Object });
defineEmits(['selected']);
</script>

<template>
    <button v-if="config.label" @click="this.$emit('selected')">{{ config.label }}</button>
    <TimeframePicker v-else/>
</template>

<style scoped lang="less">

</style>