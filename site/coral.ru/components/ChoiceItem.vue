<script setup>
import TimeframePicker from "./TimeframePicker.vue";
import { inject } from "vue";

const props = defineProps({ config: Object });
defineEmits(['selected']);
</script>

<template>
    <button v-if="config.label" @click="$emit('selected')">
        {{ typeof config.label === 'string' ? config.label : inject(config.label.predefined) }}
    </button>
    <TimeframePicker @selected="$emit('selected')" v-else/>
</template>

<style scoped lang="less">

</style>