<script setup>
import { computed, reactive, toRaw, toValue, watchEffect } from "vue";

const props = defineProps({
    modelValue:      Array,
    nightsAvailable: Array,
    searchType:      String
});
const emit = defineEmits(['shouldValidate', 'update:modelValue']);

const nightsOptions = reactive(Array.from((function* () {
    for (let idx = 1; idx <= 28; idx++) yield { value: idx };
}())));

const selectionSet = reactive(new Set());
function handleNightClick(night) {
    if (selectionSet.has(night)) {
        selectionSet.delete(night);
    } else {
        selectionSet.add(night);
        if (selectionSet.size > (props.searchType === 'package' ? 8 : 1)) {
            selectionSet.delete([...selectionSet][0]);
        }
    }
}

watchEffect(() => {
    for (const night of nightsOptions) {
        night.disabled = (props.searchType === 'disabled') || (props.searchType === 'package' && !props.nightsAvailable.includes(night.value));
        night.disabled && selectionSet.delete(night);
        if (props.searchType === 'hotel' && selectionSet.size > 1) {
            const keepThis = [...selectionSet][0];
            selectionSet.clear();
            selectionSet.add(keepThis);
        }
    }
});

watchEffect(() => {
    emit('update:modelValue', [...selectionSet].map(n => n.value));
});

const selectionReadout = computed(() => {
    const nightsOrdered = Array.from(selectionSet).map(night => night.value).sort((a, b) => a - b);
    let token;
    const tokenList = [];
    nightsOrdered.forEach((n, idx, list) => {
        if (idx === 0) {
            token = [n];
            tokenList.push(token);
        } else {
            if (n === token.at(-1) + 1) {
                token.push(n);
            } else {
                token = [n];
                tokenList.push(token);
            }
        }
    });
    if (tokenList.length) {
        return tokenList.map(token => {
            if (token.length === 1) return token[0]
            else {
                return `${ token.at(0) } - ${ token.at(-1) }`;
            }
        }).join(', ');
    } else {
        return 'Выберите...'
    }
});

</script>

<template>
    <el-popover trigger="click" placement="bottom-start" width="auto" :teleported="false" @hide="$emit('shouldValidate')">
        <template #reference>
            <div class="input-readout">{{ selectionReadout }}</div>
        </template>
        <div class="nights-grid">
            <button v-for="night in nightsOptions"
                    :class="{
                        selected: selectionSet.has(night),
                        disabled: night.disabled
                    }"
                    @click="handleNightClick(night)">{{ night.value }}</button>
        </div>
    </el-popover>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.input-readout {
    width: 100%;
    line-height: 2.5;
    border-radius: 4px;
    padding: 0 .75em;
    box-shadow: inset 0 0 0 2px fade(@coral-main-blue, 15%);
    cursor: pointer;
    .transit(box-shadow);
    &:hover {
        box-shadow: inset 0 0 0 1px @coral-main-blue;
    }
}
.nights-grid {
    display: grid;
    grid-template-columns: repeat(7,auto);
    gap: .5em;
    button {
        .interactive();
        outline: none;
        line-height: 1;
        width: 2.5em;
        height: 2.5em;
        display: inline-grid;
        place-content: center;
        cursor: pointer;
        border: 0;
        border-radius: 3px;
        background-color: fade(@coral-main-blue, 8%);
        .transit(opacity, .25s);
        .transit(background, .25s);
        .transit(color, .25s);
        &.disabled {
            pointer-events: none;
            opacity: .15;
        }

        &.selected {
            background-color: @coral-main-blue;
            color: white;
        }
    }
}
</style>