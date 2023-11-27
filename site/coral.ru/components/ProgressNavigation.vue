<script setup>

import { computed, inject } from "vue";

const { stepBack, skip, stepByKey } = inject('flow-control');
const stepConfig = inject('current-step-config');
const anyChoiceSelected = computed(() => {
    return stepConfig.value.choices.some(choice => choice.selected);
});

function skipProceedHandler() {
    if (anyChoiceSelected.value) {

    } else {
        if (stepConfig.value.behaviour?.skip) {
            skip(stepConfig.value.behaviour?.skip);
        }
    }
}

</script>

<template>
    <div class="progress-navigation">
        <button class="back" @click="stepBack">Назад</button>
        <div class="progress-bar"><div class="filler"></div></div>
        <button class="skip-proceed"
                :class="{ [anyChoiceSelected ? 'proceed' : 'skip']: true }"
                @click="skipProceedHandler">{{ anyChoiceSelected ? 'Продолжить' : 'Пропустить' }}</button>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.progress-navigation {
    overflow: hidden;
    width: 100%;
    display: flex;
    gap: 1em;
    align-items: center;
    background-color: white;
    border-radius: 1em;
    height: (66/20em);
    margin-top: 1em;
    padding: .5em .7em;
    .transit(all);
    @media screen and (max-width: @mobile-breakpoint) {
        padding: 1.7em .7em;
    }
    &.slide-enter-from, &.slide-leave-to {
        margin-top: 0;
        height: 0;
        padding-top: 0;
        padding-bottom: 0;
        opacity: 0;
    }
    >button {
        .interactive();
        outline: none;
        display: inline-flex;
        align-items: center;
        font-family: inherit;
        font-weight: bold;
        font-size: (14/20em);
        line-height: 1;
        height: 3em;
        border-radius: .5em;
        background-color: transparent;
        border: 0;
        cursor: pointer;
        &:before, &:after {
            font-family: "Material Icons";
            font-size: 1.5em;
        }
        &.back {
            padding-right: 1em;
            &:before {
                content: 'keyboard_arrow_left';
                margin-right: .2em;
            }
        }
        &.skip-proceed {
            padding-left: 1em;
            &:after {
                content: 'keyboard_arrow_right';
                margin-left: .2em;
            }
            &.skip {
                color: white;
                background: @coral-ramp-bg;
            }
            &.proceed {
                color: white;
                background: linear-gradient(46deg, #6BDCFF, #13A0F0);
            }
        }
    }
    .progress-bar {
        position: relative;
        height: 9px;
        flex-grow: 1;
        background-color: #C9C9C9;
        border-radius: 100px;
        .filler {
            width: 50%;
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            border-radius: 100px;
            background: linear-gradient(to right, #8ACB00, #0199DB);
            .transit(all);
        }
    }
}
</style>