<script setup>
import ChoiceGrid from "./ChoiceGrid.vue";
import { useStepBehaviour } from "./step-behaviour";
import { inject, ref } from "vue";

const config = useStepBehaviour();

const layoutMode = inject('layout-mode');

const $el = ref();

</script>

<template>
    <div ref="$el" class="destination-selector">
        <div class="switchers">
            <div class="controls">controls</div>
        </div>
        <div></div>
    </div>
</template>

<style scoped lang="less">
.destination-selector {
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 1em;
    .switchers {
        background: white;
        border-radius: 1em;
        padding: 1em;
        .controls {
            font-size: (14/20em);
        }
    }
}
</style>