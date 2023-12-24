<script setup>

</script>

<template>
    <el-popover trigger="click" placement="bottom-start">
        <template #reference>
            <div class="input-readout">7, 8, 12-14</div>
        </template>
        <div class="nights-grid">
            grid
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
</style>