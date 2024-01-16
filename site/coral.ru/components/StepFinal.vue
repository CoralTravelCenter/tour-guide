<script setup>
import { useStepBehaviour } from "./step-behaviour";
import { computed, getCurrentInstance, inject, onMounted, ref, watchEffect } from "vue";
import {
    fetchAvailableFlights,
    fetchAvailableNights,
    fetchHotelSearchLink,
    fetchPackageSearchLink
} from "./api-adapter";
import NightsSelector from "./NightsSelector.vue";
import PaxSelector from "./PaxSelector.vue";
import { params2query, queryParam } from "./usefuls";

const me = inject('fin-step-component');
me.value = getCurrentInstance();

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

const preferDatesFormField = ref();
const preferDates = ref([
    preferredSearchParams.timeframe.startMoment?.toDate(),
    preferredSearchParams.timeframe.endMoment?.toDate()
]);

function validatePreferDates(popoverOpened) {
    if (!popoverOpened) {
        const [startDate, endDate] = preferDates.value || [];
        const invalid = !(startDate && endDate);
        preferDatesFormField.value.classList.toggle('invalid', invalid);
        return !invalid;
    }
}

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
        // outOfWeek = timespan_days > 6;
        outOfWeek = timespan_days > 3;
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

const nightsField = ref();
const nightsSelected = ref([]);
const nightsAvailable = ref([]);

function validateNights() {
    validatePreferDates();
    const valid = nightsSelected.value.length;
    nightsField.value.classList.toggle('invalid', !valid);
    return valid;
}

watchEffect(() => {
    const [beginDate, endDate] = preferDates.value || [];
    if (beginDate && endDate) {
        const [beginMoment, endMoment] = [beginDate, endDate].map(date => moment(date));
        fetchAvailableNights(selectedDeparture.value, selectedDestination.value, preferredSearchParams.chartersOnly,
            beginMoment.format('YYYY-MM-DD'), endMoment.format('YYYY-MM-DD'))
            .then(list => nightsAvailable.value = list);
    }
});

const flightAvailableInSelectedRange = computed(() => {
    const [beginDate, endDate] = preferDates.value || [];
    const [beginMoment, endMoment] = [beginDate, endDate].map(date => moment(date));
    return !!flightList.value.find(flight => moment(flight.timestamp).isBetween(beginMoment, endMoment.endOf('day')));
});

const searchType = computed(() => {
    const [beginDate, endDate] = preferDates.value || [];
    if (beginDate && endDate) {
        return flightAvailableInSelectedRange.value ? 'package' : 'hotel';
    } else {
        return 'disabled';
    }
});

const budgetMin = ref(preferredSearchParams.budget.min || null);
const budgetMax = ref(preferredSearchParams.budget.max || null);
const { currencyCode, currencySymbol } = inject('currency');

function parseBudget(input) {
    return input.replace(/\D/g, '');
}

function formatBudget(input) {
    return input.replace(/\D/g, '').split('').reverse().join('').replace(/\d{3}(?=.)/g, "$& ").split('').reverse().join('');
}

const guests = ref({ Adults: 2, Children: [] });

function applyFilters(params) {
    if (budgetMin.value || budgetMax.value) {
        params.f ||= {};
        params.f.Pr = [(Number(budgetMin.value) || 0.0), (Number(budgetMax.value === Infinity ? 0.0 : budgetMax.value) || 0.0)];
        debugger;
    }
    if (preferredSearchParams.regionFilter?.length) {
        params.f ||= {};
        params.f.Rg = preferredSearchParams.regionFilter;
    }
    for (const [key, list] of Object.entries(preferredSearchParams.musthaveFilter)) {
        params.f ||= {};
        params.f[key] = JSON.parse(JSON.stringify(list));
    }
    return params;
}

function performSearch() {
    if (validateNights()) {
        const resultsWindow = window.open('about:blank', '_blank');
        const target_host = location.hostname === 'localhost' ? 'https://www.coral.ru' : '';
        if (searchType.value === 'package') {
            const beginDate = moment(preferDates.value[0]).format('YYYY-MM-DD');
            const endDate = moment(preferDates.value[1]).format('YYYY-MM-DD');
            fetchPackageSearchLink(
                selectedDeparture.value, selectedDestination.value, preferredSearchParams.chartersOnly,
                guests.value,
                beginDate, endDate, beginDate,
                nightsSelected.value)
                .then(href => {
                    const [url] = href.split('?');
                    const params = applyFilters(queryParam(undefined, href));
                    console.log('+++ params: %o', params);
                    resultsWindow.location.href = target_host + url + '?' + params2query(params);
                });
        } else if (searchType.value === 'hotel') {
            const beginDate = moment(preferDates.value[0]).format('YYYY-MM-DD');
            const endDate = moment(preferDates.value[0]).add({ d: nightsSelected.value[0] }).format('YYYY-MM-DD');
            fetchHotelSearchLink(selectedDestination.value, guests.value, beginDate, endDate)
                .then(href => {
                    const [url] = href.split('?');
                    const params = applyFilters(queryParam(undefined, href));
                    console.log('+++ params: %o', params);
                    resultsWindow.location.href = target_host + url + '?' + params2query(params);
                });

        }
    }
}
defineExpose({ performSearch });

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
                           :teleported="true"
                           :style="{width: '100%'}">
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
            <div class="form-field" ref="preferDatesFormField">
                <div class="label">Период вылета (макс. 7 дней)</div>
                <el-date-picker v-model="preferDates"
                                type="daterange"
                                :editable="false" :clearable="true"
                                @calendar-change="detectDateStartChange"
                                :popper-options="{ placement: 'bottom-end' }"
                                :teleported="false" @visible-change="validatePreferDates">
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
            <div class="form-field" ref="nightsField">
                <div class="label">Ночей</div>
                <NightsSelector v-model="nightsSelected"
                                :nights-available="nightsAvailable"
                                :search-type="searchType"
                                @should-validate="validateNights"/>
            </div>
            <div class="form-field">
                <div class="label">Туристы</div>
                <PaxSelector v-model="guests"/>
            </div>
            <div class="form-field">
                <div class="label">Бюджет на поездку</div>
                <el-input v-model="budgetMin" clearable :parser="parseBudget" :formatter="formatBudget" :input-style="{ textAlign: 'center' }">
                    <template #prepend>от</template>
                    <template #append><span :style="{ fontFamily: currencyCode === 'RUB' ? 'Material Icons' : 'inherit' }">
                        {{ currencyCode === 'RUB' ? 'currency_ruble' : currencySymbol }}</span></template>
                </el-input>
            </div>
            <div class="form-field">
                <div class="label">&nbsp;</div>
                <el-input v-model="budgetMax" clearable :parser="parseBudget" :formatter="formatBudget" :input-style="{ textAlign: 'center' }">
                    <template #prepend>до</template>
                    <template #append><span :style="{ fontFamily: currencyCode === 'RUB' ? 'Material Icons' : 'inherit' }">
                        {{ currencyCode === 'RUB' ? 'currency_ruble' : currencySymbol }}</span></template>
                </el-input>
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
    //text-align: center;
    padding: 1em 1.5em;
    @media screen and (max-width: @mobile-breakpoint) {
        gap: 1em;
        padding: 2em 1em;
    }
    h2 {
        color: @coral-main-yellow;
    }
    .search-params-form {
        font-size: (14/20em);
        width: 100%;
        display: grid;
        gap: 1em;
        grid-template-columns: repeat(2, 1fr);
        .form-field {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            .label {
                font-size: (13/14em);
                font-weight: bold;
                line-height: 1;
                margin-bottom: .25em;
                .transit(color);
            }
            &.invalid {
                .label {
                    color: @coral-red-error;
                    & + :deep(*) {
                        box-shadow: 0 0 1px 1px @coral-red-error;
                    }
                }
            }
        }
    }

    :deep(.el-date-range-picker) {
        @media screen and (max-width: @narrow-breakpoint) {
            width: unset;
        }
    }

    :deep(.el-date-range-picker) {
        @media screen and (max-width: @narrow-breakpoint) {
            .el-picker-panel__body {
                min-width: 25em;
                display: grid;
                line-height: 1;
            }
            .el-picker-panel__content {
                width: unset;
                white-space: nowrap;
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
                width: calc(~"100% - 4px");
                display: none;
                &.available {
                    display: unset;
                    color: @coral-green-accent;
                    background-color: fade(@coral-green-accent, 8%);
                }
                &.unavailable {
                    display: unset;
                    color: @coral-red-error;
                    background-color: fade(@coral-red-error, 8%);
                }
            }
        }
    }

    :deep(.el-date-editor.el-input__wrapper) {
        width: unset;
    }

    :deep(.el-input-group__append), :deep(.el-input-group__prepend) {
        padding: 0 1em;
    }

}
</style>