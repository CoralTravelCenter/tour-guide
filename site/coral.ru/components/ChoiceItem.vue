<script setup>
import TimeframePicker from "./TimeframePicker.vue";

const props = defineProps({ config: Object });
defineEmits(['selected']);
</script>

<template>
    <button v-if="config.label" @click="$emit('selected')">{{ config.label }}</button>
    <TimeframePicker @selected="$emit('selected')" v-else/>
</template>

<style scoped lang="less">

</style>