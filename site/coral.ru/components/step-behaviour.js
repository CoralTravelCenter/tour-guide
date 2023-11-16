import { inject, onMounted } from "vue";

export function useStepBehaviour({ config }) {
    const { backdropStack, backdropSolidFill } = inject('backdrop');
    onMounted(() => {
        if (config.setBackdrop !== undefined) {
            backdropStack.splice(0, backdropStack.length, ...(config.setBackdrop || []));
        }
        if (config.setSolidFill) {
            backdropSolidFill.value = config.setSolidFill;
        }
    });
}