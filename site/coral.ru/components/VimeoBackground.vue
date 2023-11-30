<script setup>
import { onMounted, ref } from "vue";
import { preloadScript } from "./usefuls";

const props = defineProps({ vimeoId: String });

const $el = ref();

let vimeoPlayer = null;

onMounted(async () => {
    window.Vimeo?.Player || await preloadScript('https://player.vimeo.com/api/player.js');
    const io = new IntersectionObserver((entries, observer) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                if (vimeoPlayer) {
                    vimeoPlayer.play();
                } else {
                    vimeoPlayer = new Vimeo.Player($el.value, { id: props.vimeoId, background: 1, playsinline: 1, autopause: 0, title: 0, byline: 0, portrait: 0 });
                    vimeoPlayer.on('play', () => {
                        $el.value.classList.add('playback');
                    });
                }
            } else {
                vimeoPlayer?.pause();
            }
        }
    }, { threshold: .33 });
    io.observe($el.value);
});

</script>

<template>
    <div ref="$el" class="vimeo-player"></div>
</template>

<style scoped lang="less">
@import "../common/css/layout";
.vimeo-player {
    .abs100x100();
    pointer-events: none;
    opacity: 0;
    .transit(opacity, 1s);
    &.playback {
        opacity: 1;
    }
    :deep(iframe) {
        .abs100x100();
    }
}
</style>