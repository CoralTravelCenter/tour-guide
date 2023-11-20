import { inject, onMounted } from "vue";

export function useStepBehaviour() {
    const { backdropStack, backdropSolidFill } = inject('backdrop');
    const config = inject('current-step-config');
    onMounted(() => {
        if (config.value.setBackdrop !== undefined) {
            backdropStack.splice(0, backdropStack.length, ...(config.value.setBackdrop || []));
        }
        if (config.value.setSolidFill) {
            backdropSolidFill.value = config.value.setSolidFill;
        }
    });
    return config;
}