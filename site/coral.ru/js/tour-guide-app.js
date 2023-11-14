import { createApp } from "vue";
import TourGuide from "../components/TourGuide.vue";

createApp({
    components: {
        TourGuide
    },
    template: '<h2>Tour Guide</h2><TourGuide/>'
}).mount('#tour-guide-app');