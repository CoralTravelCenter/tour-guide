<script setup>
import { inject, onMounted } from "vue";

const props = defineProps(['config']);

const { backdropStack } = inject('backdrop');

onMounted(() => {
    if (props.config.setBackdrop) {
        backdropStack.splice(0, backdropStack.length, props.config.setBackdrop);
    }
});
</script>

<template>
    <div class="step-intro">
        <h2>Получите персональную подборку туров прямо на сайте</h2>
        <p>ответив на простые вопросы о предпочтениях на отдыхе</p>
        {{ config.instance }}
    </div>
</template>

<style scoped lang="less">
.step-intro {
    background-color: white;
    border-radius: 1em;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}
</style>