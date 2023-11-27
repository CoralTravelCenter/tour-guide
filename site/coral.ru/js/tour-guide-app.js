import { createApp } from "vue";
import TourGuide from "../components/TourGuide.vue";
import StepIntro from "../components/StepIntro.vue";
import StepSimpleChoice from "../components/StepSimpleChoice.vue";
import StepMultipleChoice from "../components/StepMultipleChoice.vue";

createApp({
    components: { TourGuide },
    template: '<Suspense><TourGuide/></Suspense>'
})
    .component('StepIntro', StepIntro)
    .component('StepSimpleChoice', StepSimpleChoice)
    .component('StepMultipleChoice', StepMultipleChoice)
    .mount('#tour-guide-app');
