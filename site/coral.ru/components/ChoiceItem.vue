<script setup>
import TimeframePicker from "./TimeframePicker.vue";
import { inject } from "vue";

const props = defineProps({ config: Object });
defineEmits(['selected']);
</script>

<template>
    <button v-if="config.label" @click="$emit('selected')" v-html="typeof config.label === 'string' ? config.label : inject(config.label.predefined)"></button>
    <TimeframePicker v-else @selected="$emit('selected')"/>
</template>

<style scoped lang="less">

</style>