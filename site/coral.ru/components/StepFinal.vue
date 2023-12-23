<script setup>
import { useStepBehaviour } from "./step-behaviour";
import { computed, inject, onMounted, ref, watchEffect } from "vue";
import { fetchAvailableFlights } from "./api-adapter";

const config = useStepBehaviour();

const h2MobilePlaceholder = inject('h2-mobile-placeholder');
const layoutMode = inject('layout-mode');
const isDesktopLayout = computed(() => layoutMode.value === 'desktop');

const preferredSearchParams = inject('preferred-search-params');

const { selectedDestination } = inject('destination-selector');

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

const dateRangeStart = ref();
function detectDateStartChange([start, end]) {
    dateRangeStart.value = start && !end ? start : null;
    console.log('+++ detectDateStartChange: %o', dateRangeStart.value);
}

function excludeDate(date) {
    date = moment(date);
    const now = moment();
    const yearAfter = moment().add({ y: 1});
    const isPast = date.isBefore(now);
    const isYearAfter = date.isAfter(yearAfter);

    let outOfWeek = false;
    if (dateRangeStart.value) {
        const timespan_days = Math.abs(moment.duration(moment(date).diff(moment(dateRangeStart.value))).asDays());
        outOfWeek = timespan_days > 6;
    }

    return isPast || isYearAfter || outOfWeek;
}

const flightList = ref([]);

function isFlightAvailable(date) {
    return !!flightList.value.find(flight => moment(date).isSame(moment(flight.timestamp), 'day'));
}

watchEffect(() => {
    fetchAvailableFlights(selectedDeparture.value, selectedDestination.value, preferredSearchParams.chartersOnly)
        .then(list => flightList.value = list);
});

window.ElementPlus.dayjs().$locale().weekStart = 1;

const nightsSelected = ref([]);


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
                           default-first-option
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
                                :editable="false" :clearable="true"
                                @calendar-change="detectDateStartChange"
                                :teleported="false">
                    <template #default="cell">
                        <div class="cell" :class="{
                            disabled: excludeDate(cell.date),
                            ['range-start']: cell.start,
                            ['range-end']: cell.end,
                            ['in-range']: cell.inRange
                        }" @click="$event => $event.currentTarget.classList.contains('disabled') && $event.stopPropagation()">
                            <span class="date">{{ cell.text }}</span>
                            <span class="flight"
                                  :class="{ [isFlightAvailable(cell.date) ? 'available' : 'unavailable']: true }">
                                {{ isFlightAvailable(cell.date) ? 'airplanemode_on' : 'airplanemode_off' }}
                            </span>
                        </div>
                    </template>
                </el-date-picker>
            </div>
            <div class="form-field">
                <div class="label">Ночей</div>
                <el-select v-model="nightsSelected" multiple :multiple-limit="7" clearable :teleported="false"
                           collapse-tags :max-collapse-tags="0">
                    <el-option v-for="n in [1,2,3,4,5,6,7,8,9,10]"
                               :key="n" :label="n" :value="n"></el-option>
                </el-select>
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
        td {
            width: unset;
            height: unset;
            padding: .25em 0;
        }
        .cell {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            line-height: 1.2;
            height: 2.4em;
            cursor: unset;
            .transit(background, .2s);
            .transit(color, .2s);
            &.disabled {
                //pointer-events: none;
                cursor: not-allowed;
                opacity: .15;
                .flight {
                    display: none;
                }
            }
            &:not(.disabled) {
                &.range-start, &.range-end {
                    background-color: @coral-main-blue!important;
                    color: white;
                }
                &.range-start {
                    border-top-left-radius: 5px;
                    border-bottom-left-radius: 5px;
                }
                &.range-end {
                    border-top-right-radius: 5px;
                    border-bottom-right-radius: 5px;
                }
                &.in-range {
                    background-color: fade(@coral-main-blue, 15%);
                }
            }
            .date {
                font-weight: bold;
            }
            .flight {
                font-family: "Material Icons";
                display: none;
                &.available {
                    display: unset;
                    color: @coral-green-accent;
                }
                &.unavailable {
                    display: unset;
                    color: @coral-red-error;
                }
            }
        }
    }

    :deep(.el-date-editor.el-input__wrapper) {
        width: unset;
    }

}
</style>