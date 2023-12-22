<script setup>
import { useStepBehaviour } from "./step-behaviour";
import { computed, inject, ref } from "vue";
import ElementPlus from "element-plus";

const config = useStepBehaviour();

const h2MobilePlaceholder = inject('h2-mobile-placeholder');
const layoutMode = inject('layout-mode');
const isDesktopLayout = computed(() => layoutMode.value === 'desktop');

const preferredSearchParams = inject('preferred-search-params');

const { departures, selectedDeparture } = inject('departures');
const matchedDepartures = computed(() => {
    return departures.filter(dep => {
        const pattern_input = departureInputPattern.value?.trim();
        if (pattern_input) {
            const words_uc = pattern_input.toUpperCase().split(/\s+/);
            const dep_name_words_uc = (dep.correctName || dep.name).toUpperCase().split(/\s+/);
            return words_uc.reduce((matched, word) => {
                if (!matched) return false;
                const idx = dep_name_words_uc.findIndex(dep_word => dep_word.indexOf(word) === 0);
                if (~idx) {
                    dep_name_words_uc.splice(idx, 1);
                    return true;
                }
                return false;
            }, true);
        }
        return true;
    });
});
const departureInputPattern = ref();

const preferDates = ref([
    preferredSearchParams.timeframe.startMoment?.toDate(),
    preferredSearchParams.timeframe.endMoment?.toDate()
]);

function excludeDate(date) {
    date = moment(date);
    const now = moment();
    const yearAfter = moment().add({ y: 1});
    const isPast = date.isBefore(now);
    const isYearAfter = date.isAfter(yearAfter);

    return isPast || isYearAfter;
}

window.ElementPlus.dayjs().$locale().weekStart = 1;

</script>

<template>
    <div class="step-final">
        <Teleport :to="h2MobilePlaceholder" :disabled="isDesktopLayout">
            <h2 v-if="config.h2">{{ config.h2 }}</h2>
        </Teleport>
        <h3 v-if="config.h3">{{ config.h3 }}</h3>
        <div class="search-params-form">
            <div class="form-field">
                <div class="label">Вылет</div>
                <el-select v-model="selectedDeparture"
                           value-key="eeID"
                           filterable
                           :filter-method="input => departureInputPattern = input"
                           :teleported="true">
                    <template #empty><div style="text-align:center; padding: 1em;">Не найден</div></template>
                    <el-option v-for="departure in matchedDepartures"
                               :size="layoutMode.value === 'mobile' ? 'small' : 'default'"
                               :key="departure.eeID"
                               :label="`из ${ departure.fromForm }`"
                               :value="departure">
                        <span>{{ departure.correctName || departure.name }}</span>
                    </el-option>
                </el-select>
            </div>
            <div class="form-field">
                <div class="label">Период вылета (макс. 7 дней)</div>
                <el-date-picker v-model="preferDates"
                                type="daterange"
                                :editable="false" :clearable="false" :teleported="false"
                                :disabled-date="excludeDate"></el-date-picker>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
@import "../common/css/coral-colors";
@import "../common/css/layout";
.step-final {
    background-color: white;
    border-radius: 1em;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    text-align: center;
    padding: 1em 1.5em;
    @media screen and (max-width: @mobile-breakpoint) {
        gap: 1em;
        padding: 2em 1em;
    }
    h2 {
        color: @coral-main-yellow;
    }
    .search-params-form {
        width: 100%;
        display: grid;
        gap: 1em;
        grid-template-columns: repeat(2, 1fr);
        .form-field {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            .label {
                font-size: (13/20em);
                font-weight: bold;
                line-height: 1;
                margin-bottom: .25em;
            }
        }
    }



    :deep(.el-date-table) {
        td.disabled .el-date-table-cell {
            opacity: .25;
        }
    }

    :deep(.el-date-editor.el-input__wrapper) {
        width: unset;
    }

}
</style>