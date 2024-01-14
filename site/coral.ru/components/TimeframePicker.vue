<script setup>
import VueDatePicker from '@vuepic/vue-datepicker';
import { computed, inject, onUnmounted, reactive, ref, watch } from "vue";

const monthName = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const tomorrow = moment().add({ d: 1});
const maxDate = moment(tomorrow).add({ y: 1});

const $el = ref();
const datePicker = ref();
const open = ref(false);
const emit = defineEmits(['selected']);

function listenClicks(e) {
    if (!$el.value.contains(e.target)) {
        selectedTimeframe.startMoment = selectedTimeframe.endMoment = null;
        datePicker.value.updateInternalModelValue(null);
        open.value = false;
    }
}

watch(open, (newValue) => {
    if (newValue) {
        document.addEventListener('click', listenClicks);
    } else {
        document.removeEventListener('click', listenClicks);
    }
});

const selectedTimeframe = reactive({ startMoment: null, endMoment: null });
const cantChoose = computed(() => {
    return selectedTimeframe.startMoment === null;
});

const labelFeedback = computed(() => {
    let feedback = 'Выберу даты';
    if (selectedTimeframe.startMoment) {
        if (selectedTimeframe.startMoment.month() !== selectedTimeframe.endMoment.month()) {
            return `${ selectedTimeframe.startMoment.date() } ${ monthName[selectedTimeframe.startMoment.month()] } &mdash; ${ selectedTimeframe.endMoment.date() } ${ monthName[selectedTimeframe.endMoment.month()] }`;
        } else if (selectedTimeframe.startMoment.date() !== selectedTimeframe.endMoment.date()) {
            return `${ selectedTimeframe.startMoment.date() } &mdash; ${ selectedTimeframe.endMoment.date() } ${ monthName[selectedTimeframe.endMoment.month()] }`;
        } else {
            return `${ selectedTimeframe.startMoment.date() } ${ monthName[selectedTimeframe.startMoment.month()] }`;
        }
    }
    return feedback;
});

function updateTimeframe(timeframe) {
    const [frameStartDate, frameEndDate] = timeframe ?? [];
    if (frameStartDate) {
        selectedTimeframe.startMoment = moment(frameStartDate);
        if (frameEndDate) {
            selectedTimeframe.endMoment = moment(frameEndDate);
        } else {
            selectedTimeframe.endMoment = moment(frameStartDate);
        }
    } else {
        selectedTimeframe.startMoment = selectedTimeframe.endMoment = null;
    }
}

const preferredSearchParams = inject('preferred-search-params');
function doChoose() {
    preferredSearchParams.timeframe.startMoment = moment(selectedTimeframe.startMoment);
    preferredSearchParams.timeframe.endMoment = moment(selectedTimeframe.endMoment);
    preferredSearchParams.timeframe.selectedMoment = moment(selectedTimeframe.startMoment);
    emit('selected');
}

onUnmounted(() => {
    document.removeEventListener('click', listenClicks);
});

</script>

<template>
    <div ref="$el" class="timeframe-picker" :class="{ open }">
        <div class="toggler" @click="open = !open">
            <span class="icon">calendar_month</span>
            <span class="label" v-html="labelFeedback"></span>
        </div>
        <div class="drawer">
            <VueDatePicker ref="datePicker"
                           inline locale="ru" range
                           :enable-time-picker="false"
                           month-name-format="long"
                           :min-date="tomorrow.toDate()"
                           :max-date="maxDate.toDate()"
                           :prevent-min-max-navigation="true"
                           max-range="3"
                           select-text="Выбрать"
                           @internal-model-change="updateTimeframe">
                <template #action-preview></template>
                <template #action-buttons>
                    <button @click="doChoose" class="do-choose" :disabled="cantChoose">Выбрать</button>
                </template>
            </VueDatePicker>
        </div>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
@import "../common/css/mixins";
.timeframe-picker {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    .transit(filter);
    > * {
        flex-shrink: 0;
    }
    &.open {
        filter: drop-shadow(0 4px 16px fade(black,15%));
        .toggler {
            border-radius: .5em .5em 0 0;
            background: @coral-ramp-bg;
            color: white;
            box-shadow: none;
        }
        .drawer {
            max-height: 22em;
        }
    }
    .toggler {
        .interactive();
        position: relative;
        width: 100%;
        font-family: inherit;
        line-height: 1;
        font-size: inherit;
        color: black;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        height: (48/20em);
        padding: 0 1.5em;
        border-radius: .5em;
        cursor: pointer;
        background: linear-gradient(0deg, white, white);
        box-shadow: inset 0 0 0 2px currentColor;
        .transit(background);
        .transit(border-radius);
        @media screen and (max-width: @narrow-breakpoint) {
            box-shadow: inset 0 0 1px 1px currentColor;
        }
        .icon {
            position: absolute;
            left: 0;
            top: 0;
            width: 2em;
            height: 1.5em;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            font-family: "Material Icons";
            font-size: 1.5em;
            font-weight: normal;
        }
    }
    &.selected .toggler, .toggler:hover {
        background: @coral-ramp-bg;
        color: white;
        box-shadow: none;
    }
    .drawer {
        max-height: 0;
        overflow: hidden;
        background: white;
        border-radius: 0 0 .5em .5em;
        .transit(max-height);

        --dp-font-family: inherit;
        --dp-font-size: .7em;
        --dp-cell-size: 2em;
        @media screen and (max-width: @narrow-breakpoint) {
            --dp-font-size: 1.0em;
        }
        :deep(.dp__theme_light) {
            --dp-menu-border-color: transparent;
            --dp-text-color: black;
            //--dp-hover-color: #f3f3f3;
            --dp-hover-color: @coral-main-blue;
            --dp-hover-text-color: white;
            //--dp-primary-color: #1976d2;
            --dp-primary-color: @coral-main-blue-accent;
            //--dp-primary-text-color: #f8f5f5;
            --dp-primary-text-color: white;
            //--dp-secondary-color: #c0c4cc;
            //--dp-highlight-color: rgb(25 118 210 / 10%);
            //--dp-range-between-dates-background-color: var(--dp-hover-color, #f3f3f3);
            --dp-range-between-dates-background-color: fade(@coral-main-blue, 10%);
            //--dp-range-between-dates-text-color: var(--dp-hover-text-color, #212121);
            --dp-range-between-dates-text-color: black;
            //--dp-range-between-border-color: var(--dp-hover-color, #f3f3f3);
            --dp-range-between-border-color: var(--dp-range-between-dates-background-color);
        }
        :deep(button) {
            outline: none;
        }
        :deep(button[aria-disabled]) {
            visibility: hidden;
        }
        :deep(.dp__main) {
            justify-content: center;
            .dp__outer_menu_wrap {
                flex-grow: 1;
                .dp__calendar_item {
                    display: flex;
                    justify-content: center;
                    .dp__cell_inner {
                        flex-grow: 1;
                    }
                }
            }
        }
        :deep(.dp__action_buttons) {
            flex: 1;
        }
        :deep(.do-choose) {
            .button-like();
            flex: 1;
        }
    }
}
</style>