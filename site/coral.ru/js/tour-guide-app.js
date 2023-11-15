import { createApp } from "vue";
import TourGuide from "../components/TourGuide.vue";
import StepIntro from "../components/StepIntro.vue";

createApp({
    components: { TourGuide },
    template: '<TourGuide/>'
})
    .component('StepIntro', StepIntro)
    .mount('#tour-guide-app');
