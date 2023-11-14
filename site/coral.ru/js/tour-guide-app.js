import { createApp } from "vue";
import TourGuide from "../components/TourGuide.vue";

createApp({
    components: {
        TourGuide
    },
    template: '<TourGuide/>'
}).mount('#tour-guide-app');