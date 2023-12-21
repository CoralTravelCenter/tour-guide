import { createApp } from "vue";
import ElementPlus from 'element-plus';
import TourGuide from "../components/TourGuide.vue";
import StepIntro from "../components/StepIntro.vue";
import StepSimpleChoice from "../components/StepSimpleChoice.vue";
import StepMultipleChoice from "../components/StepMultipleChoice.vue";
import DestinationSelector from "../components/DestinationSelector.vue";
import StepFinal from "../components/StepFinal.vue";

createApp({
    components: { TourGuide },
    template: '<Suspense><TourGuide/></Suspense>'
})
    .component('StepIntro', StepIntro)
    .component('StepSimpleChoice', StepSimpleChoice)
    .component('StepMultipleChoice', StepMultipleChoice)
    .component('DestinationSelector', DestinationSelector)
    .component('StepFinal', StepFinal)
    .use(ElementPlus)
    .mount('#tour-guide-app');
