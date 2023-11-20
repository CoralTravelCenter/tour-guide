<script setup>
import ChoiceGrid from "./ChoiceGrid.vue";
import { useStepBehaviour } from "./step-behaviour";

const config = useStepBehaviour();

</script>

<template>
    <div class="step-intro">
        <h2>Получите персональную подборку туров прямо на сайте</h2>
        <p>ответив на простые вопросы о предпочтениях на отдыхе</p>
        <ChoiceGrid trait="accented"/>
    </div>
</template>

<style scoped lang="less">
.step-intro {
    background-color: white;
    border-radius: 1em;
    display: flex;
    flex-direction: column;
    gap: 1em;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 1em 3em;
}
</style>