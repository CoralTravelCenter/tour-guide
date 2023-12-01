<script setup>
defineProps(['label', 'modelValue']);
defineEmits(['update:modelValue'])
</script>

<template>
    <div class="mode-switch">
        <div class="label">{{ label }}</div>
        <div class="switch">
            <span @click="$emit('update:modelValue', 'list')"
                  :class="{ selected: modelValue === 'list' }">Списком</span>
            <span @click="$emit('update:modelValue', 'map')"
                  :class="{ selected: modelValue === 'map' }">На карте</span>
        </div>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.mode-switch {
    display: flex;
    align-items: center;
    .label {
        margin-right: 1em;
    }
    .switch {
        display: inline-grid;
        grid-template-columns: 1fr 1fr;
        background: @coral-page-bg;
        border-radius: 5px;
        padding: 2px;
        >* {
            .interactive();
            display: flex;
            justify-content: center;
            align-items: center;
            line-height: 1;
            height: 2.1em;
            padding: 0 1.2em;
            border-radius: 3px;
            color: black;
            .transit(background);
            &.selected {
                pointer-events: none;
                background: white;
            }
            &:not(.selected) {
                cursor: pointer;
            }
        }
    }
}
</style>