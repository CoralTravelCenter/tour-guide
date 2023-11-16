import { createApp } from "vue";
import TourGuide from "../components/TourGuide.vue";
import StepIntro from "../components/StepIntro.vue";
import StepSimpleChoice from "../components/StepSimpleChoice.vue";

createApp({
    components: { TourGuide },
    template: '<TourGuide/>'
})
    .component('StepIntro', StepIntro)
    .component('StepSimpleChoice', StepSimpleChoice)
    .mount('#tour-guide-app');
