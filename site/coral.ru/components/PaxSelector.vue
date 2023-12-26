<script setup>

import { computed, reactive, toRaw, watchEffect } from "vue";

const props = defineProps({
    modelValue: Object
});
const emit = defineEmits(['update:modelValue']);

const guest = reactive(props.modelValue);

watchEffect(() => {
    emit('update:modelValue', toRaw(guest));
});

const childCount = computed({
    get() {
        return guest.Children.length;
    }, set(count) {
        const diff = count - guest.Children.length;
        guest.Children.splice(diff < 0 ? diff : Infinity, -diff, ...(diff > 0 ? new Array(diff).fill(0) : []));
    }
});

</script>

<template>
    <el-popover trigger="click" placement="bottom-end" width="auto" :teleported="false">
        <template #reference>
            <div class="input-readout">
                <span class="adult" v-for="adult in guest.Adults"></span>
                <span class="child" v-for="child in guest.Children.length"></span>
            </div>
        </template>
        <div class="pax-grid">
            <div class="pax-field count">
                <div class="label">Взрослых</div>
                <el-input-number v-model="guest.Adults" :min="1" :max="9"/>
            </div>
            <div class="pax-field count">
                <div class="label">Детей</div>
                <el-input-number v-model="childCount" :min="0" :max="3"/>
            </div>
            <div class="pax-field heading" v-if="!!guest.Children.length">
                <div class="label">Возраст детей на момент окончания поездки</div>
            </div>
            <div v-for="(child, idx) in guest.Children" class="pax-field age">
                <el-input-number v-model="guest.Children[idx]" :min="0" :max="18"/>
            </div>
        </div>
    </el-popover>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.input-readout {
    width: 100%;
    display: flex;
    justify-content: left;
    align-items: center;
    font-family: "Header Fontello";
    height: 2.5em;
    text-align: center;
    border-radius: 4px;
    padding: 0 .75em;
    box-shadow: inset 0 0 0 2px fade(@coral-main-blue, 15%);
    cursor: pointer;
    .transit(box-shadow);
    &:hover {
        box-shadow: inset 0 0 0 1px @coral-main-blue;
    }
    >span {
        margin: 0 3px;
        &.adult {
            font-size: 1.5em;
        }
        &.child {
            font-size: 1.2em;
        }
    }
}
.pax-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 1em;
    .pax-field {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        .label {
            font-size: (13/14em);
            font-weight: bold;
            line-height: 1;
            margin-bottom: .25em;
        }
        &.count {
            grid-column: span 3;
        }
        &.age {
            grid-column: span 2;
        }
        &.heading {
            grid-column: span 6;
        }
        .el-input-number {
            width: 100%;
        }
    }
}
</style>