<script setup>

</script>

<template>
    <div class="progress-navigation">
        <button class="back">Назад</button>
        <div class="progress-bar"><div class="filler"></div></div>
        <button class="skip-proceed">Продолжить</button>
    </div>
</template>

<style scoped lang="less">
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
    padding: .5em;
    .transit(all);
    &.slide-enter-from, &.slide-leave-to {
        margin-top: 0;
        height: 0;
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