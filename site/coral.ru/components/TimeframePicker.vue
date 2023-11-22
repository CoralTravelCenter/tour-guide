<script setup>

import { ref } from "vue";

const open = ref(false);

</script>

<template>
    <div class="timeframe-picker" :class="{ open }">
        <div class="toggler" @click="open = !open">
            <span class="icon">calendar_month</span>
            <span class="label">Выберу дату</span>
        </div>
        <div class="drawer"></div>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.timeframe-picker {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    .transit(filter);
    > * {
        flex-shrink: 0;
    }
    &.open {
        filter: drop-shadow(0 4px 16px fade(black,15%));
        .toggler {
            border-radius: .5em .5em 0 0;
            background: @coral-ramp-bg;
            color: white;
            box-shadow: none;
        }
        .drawer {
            height: 12em;
        }
    }
    .toggler {
        .interactive();
        position: relative;
        width: 100%;
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
        background: linear-gradient(0deg, transparent, transparent);
        box-shadow: inset 0 0 0 2px currentColor;
        .transit(background);
        .transit(border-radius);
        .icon {
            position: absolute;
            left: 0;
            top: 0;
            width: 2em;
            height: 1.5em;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            font-family: "Material Icons";
            font-size: 1.5em;
            font-weight: normal;
        }
    }
    &.selected .toggler, .toggler:hover {
        background: @coral-ramp-bg;
        color: white;
        box-shadow: none;
    }
    .drawer {
        height: 0;
        overflow: hidden;
        background: white;
        .transit(height);
    }
}
</style>