<script setup>
import { inject } from "vue";

const props = defineProps(['choices', 'behaviour', 'trait']);

const { stepByKey } = inject('flow-control');

function handleChoice(choice) {
    if (choice.action) {

    }
    if (choice.step) {
        stepByKey(choice.step);
    }
}

</script>

<template>
    <div class="choice-grid">
        <button v-for="choice in choices"
                :class="{ [trait]: true }"
                @click="handleChoice(choice)">{{ choice.label }}</button>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.choice-grid {
    width: 100%;
    display: flex;
    gap: 1em;
    flex-direction: column;
    align-items: stretch;
    >button {
        .interactive();
        outline: none;
        border: 0;
        font-family: inherit;
        line-height: 1;
        font-size: inherit;
        color: black;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        height: (48/20em);
        padding: 0 1.5em;
        border-radius: .5em;
        cursor: pointer;
        &.accented {
            background-color: @coral-main-yellow;
            color: white;
            font-weight: bold;
        }
        &.ramp-hover {
            background-color: transparent;
            box-shadow: inset 0 0 0 2px currentColor;
            .transit(background);
            &:hover {
                background: @coral-ramp-bg;
                color: white;
                box-shadow: none;
            }
        }
    }
}
</style>